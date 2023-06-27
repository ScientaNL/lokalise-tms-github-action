import { error, info } from '@actions/core';
import { Command } from '../lib/command.js';
import { Configuration } from '../lib/configuration/configuration.js';
import { TMSClient } from '../lib/lokalise-api/tms-client.js';
import { TranslationStorage } from '../lib/translation-storage/translation-storage.js';

export class AddTranslationsSnapshotToTmsCommand implements Command {
	constructor(
		private readonly configuration: Configuration,
		private readonly tmsClient: TMSClient,
		private readonly translationStorage: TranslationStorage,
	) {
	}

	public async run(): Promise<void> {
		const translations = await this.translationStorage.loadTerms();

		info(
			`${translations.length} downloaded from storage.`,
		);

		if (translations.length <= 0) {
			info(`No translations to add to the TMS`);
			await this.translationStorage.removeTerms();
			return;
		}

		let results = await this.tmsClient.addKeys(translations);

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

		await this.translationStorage.removeTerms();
	}
}
