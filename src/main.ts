import { getInput, info, setFailed, warning } from '@actions/core';
import { getOctokit } from '@actions/github';
import { AddTranslationsSnapshotToTmsCommand } from './commands/add-translations-snapshot-to-tms-command.js';
import { CleanupObsoleteKeysCommand } from "./commands/cleanup-obsolete-keys-command.js";
import { CreateTranslationFilesCommand } from './commands/create-translation-files-command.js';
import { ExtractTranslationsAndStoreCommand } from './commands/extract-translations-and-store-command.js';
import { TagObsoleteKeysCommand } from "./commands/tag-obsolete-keys-command.js";
import { Command } from './lib/command.js';
import { loadConfig } from './lib/configuration/config-parser.js';
import { Configuration } from './lib/configuration/configuration.js';
import { GithubCommentsUsingMock } from "./lib/github-pr/github-comment-using-blackhole.js";
import { GithubCommentsUsingGithub } from "./lib/github-pr/github-comment-using-github.js";
import { GithubComments } from './lib/github-pr/github-comment.js';
import { TranslationsSummaryTemplate } from "./lib/github-pr/translations-summary-template.js";
import { TMSClient, TMSEvents } from './lib/lokalise-api/tms-client.js';
import { TranslationStorageUsingFilesystem } from "./lib/translation-storage/translation-storage-using-filesystem.js";
import { TranslationStorageUsingGithubArtifacts } from "./lib/translation-storage/translation-storage-using-github-artifacts.js";
import { TranslationStorage } from './lib/translation-storage/translation-storage.js';

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
			case 'cleanupObsoleteKeys':
				app = new CleanupObsoleteKeysCommand(
					config,
					getLokaliseTmsClient(config.lokalise),
				);
				break;
			case 'tagObsoleteKeys':
				app = new TagObsoleteKeysCommand(
					config,
					getLokaliseTmsClient(config.lokalise),
				);
				break;
			default:
				throw new Error(
					'Invalid command configured in the action (extract, addSnapshot, createTranslationFiles, cleanupObsoleteKeys)',
				);
		}

		await app.run();
	} catch (e) {
		setFailed((e as Error).message);
	}
})();

function getLokaliseTmsClient(config: Configuration['lokalise']): TMSClient {
	const client =  new TMSClient(
		getInput('lokaliseApi'),
		getInput('lokaliseProject'),
		config,
	);

	client.events.on(TMSEvents.warn, warning);
	client.events.on(TMSEvents.info, info);

	return client;
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
	const templateEngine = new TranslationsSummaryTemplate(
		getInput('prCommentTemplate', {required: true}),
		getInput('prCommentSummaryTemplate', {required: true}),
	);

	return !useMock
		? new GithubCommentsUsingGithub(
			getOctokit(getInput('token', {required: true})),
			getInput('owner', {required: true}),
			getInput('repo', {required: true}),
			parseInt(getInput('pr_number', {required: true})),
			templateEngine,
		)
		: new GithubCommentsUsingMock(templateEngine);
}
