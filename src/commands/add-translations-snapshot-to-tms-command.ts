import { error, info } from '@actions/core';
import { Command } from '../lib/command.js';
import { Configuration } from '../lib/configuration/configuration.js';
import { TMSClient } from '../lib/lokalise-api/tms-client.js';
import { SnapshotData } from '../lib/snapshot.js';
import { TranslationKey } from '../lib/translation-key.js';
import { Storage } from '../lib/translation-storage/storage.js';

export class AddTranslationsSnapshotToTmsCommand implements Command {
	constructor(
		private readonly configuration: Configuration,
		private readonly tmsClient: TMSClient,
		private readonly translationStorage: Storage,
	) {
	}

	public async run(): Promise<void> {
		const translations = await this.translationStorage.downloadTranslations();
		const uniqueTranslations = this.unique(translations);

		info(
			`${translations.length} downloaded from storage. ${uniqueTranslations.length} unique translations.`,
		);

		if (uniqueTranslations.length <= 0) {
			info(`No translations to add to the TMS`);
			await this.translationStorage.removeTranslations();
			return;
		}

		let results = await this.tmsClient.addProjectKeys(uniqueTranslations);

		results = {
			...results,
			errors: results.errors.filter(
				error => error.message !== 'This key name is already taken',
			),
		};

		info(
			`Add Project Keys complete. ${results.items.length} items added. ${results.errors.length} items resulted in an error`,
		);

		if (results.errors.length) {
			error(JSON.stringify(results.errors));
		}

		await this.translationStorage.removeTranslations();
	}

	private unique(
		translations: TranslationKey<SnapshotData>[],
	): TranslationKey<SnapshotData>[] {
		const translationMap = new Map<string, TranslationKey<SnapshotData>>();
		for (const translation of translations) {
			translationMap.set(translation.keyId, translation);
		}

		return Array.from(translationMap.values());
	}
}
