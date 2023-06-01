import { getInput, setFailed } from '@actions/core';
import { getOctokit } from '@actions/github';
import { AddTranslationsSnapshotToTmsCommand } from './commands/add-translations-snapshot-to-tms-command.js';
import { CreateTranslationFilesCommand } from './commands/create-translation-files-command.js';
import { ExtractTranslationsAndStoreCommand } from './commands/extract-translations-and-store-command.js';
import { Command } from './lib/command.js';
import { loadConfig } from './lib/configuration/config-parser.js';
import { Configuration } from './lib/configuration/configuration.js';
import { GithubCommentsUsingMock } from "./lib/github-pr/github-comment-using-blackhole.js";
import { GithubCommentsUsingGithub } from "./lib/github-pr/github-comment-using-github.js";
import { GithubComments } from './lib/github-pr/github-comment.js';
import { TMSClient } from './lib/lokalise-api/tms-client.js';
import { TranslationStorageUsingFilesystem } from "./lib/translation-storage/translation-storage-using-filesystem.js";
import { TranslationStorageUsingGithubArtifacts } from "./lib/translation-storage/translation-storage-using-github-artifacts.js";
import { TranslationStorage } from './lib/translation-storage/translationStorage.js';

(async (): Promise<void> => {
	try {
		const config = await loadConfig(getInput('actions-rc'));
		const useMockServices = !!getInput('mockGithub');

		let app: Command;
		switch (getInput('command')) {
			case 'extract':
				app = new ExtractTranslationsAndStoreCommand(
					config,
					getLokaliseTmsClient(config.lokalise),
					getTranslationStorage(useMockServices),
					getGithubComments(useMockServices),
				);
				break;
			case 'addSnapshot':
				app = new AddTranslationsSnapshotToTmsCommand(
					config,
					getLokaliseTmsClient(config.lokalise),
					getTranslationStorage(useMockServices),
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

function getLokaliseTmsClient(config: Configuration['lokalise']): TMSClient {
	return new TMSClient(
		getInput('lokaliseApi'),
		getInput('lokaliseProject'),
		config,
	);
}

function getTranslationStorage(useMock: boolean = false): TranslationStorage {
	return !useMock
		? new TranslationStorageUsingGithubArtifacts(
			getOctokit(getInput('token')),
			getInput('owner'),
			getInput('repo'),
			parseInt(getInput('pr_number')),
		)
		: new TranslationStorageUsingFilesystem(
			getInput('mockStoragePath'),
			parseInt(getInput('pr_number')),
		);
}

function getGithubComments(useMock: boolean = false): GithubComments {
	return !useMock
		? new GithubCommentsUsingGithub(
			getOctokit(getInput('token')),
			getInput('owner'),
			getInput('repo'),
			parseInt(getInput('pr_number')),
		)
		: new GithubCommentsUsingMock();
}
