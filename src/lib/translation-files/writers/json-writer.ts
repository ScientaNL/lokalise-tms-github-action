import { writeFile } from "fs/promises";
import { EventEmitter } from "node:events";
import { OutputConfiguration, OutputLocale } from "../../configuration/configuration.js";
import { TMSKeyWithTranslations } from "../../translation-key.js";
import { getTranslationFromKey, TermsWriter } from "./terms-writer.js";

export class JsonWriter implements TermsWriter {
	public readonly events: EventEmitter = new EventEmitter();

	constructor(
		private readonly configuration: OutputConfiguration,
	) {
	}

	public async write(keys: TMSKeyWithTranslations[]): Promise<void> {
		const contents = this.createFileContents(keys, this.configuration.targetLocale);

		await writeFile(
			this.configuration.destination,
			JSON.stringify(contents, null, 4),
		);
	}

	private createFileContents(keys: TMSKeyWithTranslations[], target: OutputLocale): Record<string, string> {
		const output: Record<string, string> = {};
		for (const key of keys) {
			if (!key.translations) {
				throw new Error("Translations property is missing. Have you loaded the data with translations included?");
			}

			const translation = getTranslationFromKey(key, target.tms);
			if (!translation && !this.configuration.useSourceOnEmpty) {
				continue;
			}

			output[key.originalId] = translation?.translation || (this.configuration.useSourceOnEmpty ? key.originalId : '');
		}
		return output;
	}
}
