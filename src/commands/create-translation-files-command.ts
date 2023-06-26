import { info, warning } from '@actions/core';
import { Command } from '../lib/command.js';
import { Configuration, OutputConfiguration } from '../lib/configuration/configuration.js';
import { TMSClient } from '../lib/lokalise-api/tms-client.js';
import { WriterFactory } from '../lib/translation-files/writer-factory.js';
import { WriterEvents } from "../lib/translation-files/writers/terms-writer.js";
import { TMSKeyWithTranslations } from "../lib/translation-key.js";

export class CreateTranslationFilesCommand implements Command {
	constructor(
		private readonly configuration: Configuration,
		private readonly tmsClient: TMSClient,
	) {
	}

	public async run(): Promise<void> {
		info(`Get keys currently stored in the TMS`);
		const tmsKeys = await this.tmsClient.getKeysWithTranslations();
		info(`Keys get complete (${tmsKeys.length})`);

		for (const output of this.configuration.outputs) {
			info(
				`Generate translation file for ${output.type}:${output.targetLocale.output} - ${output.destination}`,
			);

			await this.generateOutput(
				tmsKeys.filter(({tags}) => tags.includes(output.tag)),
				output,
			);
		}
	}

	private async generateOutput(
		keys: TMSKeyWithTranslations[],
		configuration: OutputConfiguration,
	): Promise<void> {
		const writer = WriterFactory.factory(configuration);
		writer.events.on(WriterEvents.warn, warning);

		await writer.write(keys);
	}
}
