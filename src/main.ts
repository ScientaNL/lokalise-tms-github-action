import { getInput, setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { AddTranslationsSnapshotToTmsCommand } from './commands/add-translations-snapshot-to-tms-command.js';
import { CreateTranslationFilesCommand } from './commands/create-translation-files-command.js';
import { ExtractTranslationsAndStoreCommand } from './commands/extract-translations-and-store-command.js';
import { Command } from './lib/command.js';
import { loadConfig } from './lib/configuration/config-parser.js';
import { Configuration } from './lib/configuration/configuration.js';
import { GithubComments } from './lib/github-pr/github-comment.js';
import { TMSClient } from './lib/lokalise-api/tms-client.js';
import { Storage } from './lib/translation-storage/storage.js';

(async (): Promise<void> => {
	try {
		const config = await loadConfig(getInput('actions-rc'));

		let app: Command;
		switch (getInput('command')) {
			case 'extract':
				app = new ExtractTranslationsAndStoreCommand(
					config,
					getLokaliseTmsClient(config.lokalise),
					getTranslationStorage(),
					getGithubComments(),
				);
				break;
			case 'addSnapshot':
				app = new AddTranslationsSnapshotToTmsCommand(
					config,
					getLokaliseTmsClient(config.lokalise),
					getTranslationStorage(),
				);
				break;
			case 'createTranslationFiles':
				app = new CreateTranslationFilesCommand(
					config,
					getLokaliseTmsClient(config.lokalise),
				);
				break;
			default:
				throw new Error(
					'Invalid command configured in the action (extract, addSnapshot, createTranslationFiles)',
				);
		}

		await app.run();
	} catch (e) {
		setFailed((e as Error).message);
	}
})();

function getDynamoDBClient(): DynamoDBDocumentClient {
	return DynamoDBDocumentClient.from(
		new DynamoDBClient({
			credentials: {
				accessKeyId: getInput('dynamoDBAccessKey'),
				secretAccessKey: getInput('dynamoDBSecret'),
			},
			region: getInput('AWSRegion'),
		}),
		{
			marshallOptions: {
				removeUndefinedValues: true,
			},
		},
	);
}

function getLokaliseTmsClient(config: Configuration['lokalise']): TMSClient {
	return new TMSClient(
		getInput('lokaliseApi'),
		getInput('lokaliseProject'),
		config,
	);
}

function getTranslationStorage(): Storage {
	return new Storage(
		getDynamoDBClient(),
		getInput('dynamoDBTable'),
		parseInt(getInput('pr_number')),
	);
}

function getGithubComments(): GithubComments {
	return new GithubComments(
		getOctokit(getInput('token')),
		getInput('owner'),
		getInput('repo'),
		parseInt(getInput('pr_number')),
	);
}
