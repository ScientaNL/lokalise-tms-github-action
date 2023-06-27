import { info, warning } from '@actions/core';
import { readFile } from 'fs/promises';
import { Command } from '../lib/command.js';
import { Configuration } from '../lib/configuration/configuration.js';
import { TMSClient } from '../lib/lokalise-api/tms-client.js';
import { ReaderFactory } from '../lib/translation-files/reader-factory.js';
import { ExtractedKey } from '../lib/translation-key.js';

export class CleanupObsoleteKeysCommand implements Command {
	constructor(
		private readonly configuration: Configuration,
		private readonly tmsClient: TMSClient,
	) {
	}

	public async run(): Promise<void> {
		info(`Read keys from input files`);
		const inputKeys = await this.parseTermsFiles();

		info(`Fetch keys currently stored in the TMS`);
		const tmsKeys = await this.tmsClient.getKeys();
		info(`Keys fetched (${tmsKeys.length})`);

		const {obsoleteKeys} = this.tmsClient.diffExtractedKeysWithTMSKeys(inputKeys, tmsKeys);

		if (!obsoleteKeys.length) {
			info(`No obsolete keys found`);
			return;
		}

		info(`${obsoleteKeys.length} Obsolete ${obsoleteKeys.length === 1 ? 'key' : 'keys'} found`);

		const result = await this.tmsClient.removeKeys(obsoleteKeys);

		if (!result.keys_removed) {
			warning(`Error while deleting obsolete keys`);
		}

		info(`Obsolete keys deleted`);
	}

	private async parseTermsFiles(): Promise<ExtractedKey[]> {
		let keys: ExtractedKey[] = [];
		for (const source of this.configuration.terms) {
			const reader = await ReaderFactory.factory(source.type);
			const input = await readFile(source.terms, 'utf-8');

			keys = [...keys, ...reader.parse(input)];
		}

		return keys;
	}
}
