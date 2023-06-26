import { info } from '@actions/core';
import { readFile } from 'fs/promises';
import { Command } from '../lib/command.js';
import { Configuration } from '../lib/configuration/configuration.js';
import { GithubComments } from '../lib/github-pr/github-comment.js';
import { TMSClient } from '../lib/lokalise-api/tms-client.js';
import { SnapshotData } from '../lib/snapshot.js';
import { ReaderFactory } from '../lib/translation-files/reader-factory.js';
import { ExtractedKey } from '../lib/translation-key.js';
import { TranslationStorage } from '../lib/translation-storage/translation-storage.js';

export class ExtractTranslationsAndStoreCommand implements Command {
	constructor(
		private readonly configuration: Configuration,
		private readonly tmsClient: TMSClient,
		private readonly translationStorage: TranslationStorage,
		private readonly githubComments: GithubComments,
	) {
	}

	public async run(): Promise<void> {
		info(`Read keys from input files`);
		const inputKeys = await this.parseTermsFiles();

		info(`Fetch keys currently stored in the TMS`);
		const tmsKeys = await this.tmsClient.getKeys();
		info(`Keys fetched (${tmsKeys.length})`);

		const {newKeys} = this.tmsClient.diffExtractedKeysWithTMSKeys(inputKeys, tmsKeys);

		if (newKeys.length) {
			info(`${newKeys.length} New keys found. Store them in the storage.`);
			await this.translationStorage.saveTranslations(newKeys);

			info(`Write comment with new translations to PR`);
			await this.githubComments.writeTranslationsToPR(newKeys);
		} else {
			info(`No new keys found. Store result into storage`);
			await this.translationStorage.saveTranslations([]);

			info(`Remove comment from PR (if one)`);
			await this.githubComments.removeTranslationsComment();
		}
	}

	private async parseTermsFiles(): Promise<ExtractedKey<SnapshotData>[]> {
		let keys: ExtractedKey<SnapshotData>[] = [];
		for (const source of this.configuration.terms) {
			const reader = await ReaderFactory.factory(source.type);
			const input = await readFile(source.terms, 'utf-8');

			const associatedSnapshotData = this.configuration.snapshots.find(
				({tag}) => tag === source.tag,
			);

			keys = [
				...keys,
				...reader.parse(input).map(key => ({
					...key,
					snapshotData: associatedSnapshotData,
				})),
			];
		}

		return keys;
	}
}
