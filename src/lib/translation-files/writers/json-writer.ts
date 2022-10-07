import { Key } from "@lokalise/node-api";
import { writeFile } from "fs/promises";
import { OutputConfiguration, OutputLocale } from "../../configuration/configuration.js";
import { getOriginalIdFromKey, getTranslationFromKey, TermsWriter } from "./terms-writer.js";

export class JsonWriter implements TermsWriter {
	constructor(
		private readonly configuration: OutputConfiguration,
	) {
	}

	public async write(keys: Key[]): Promise<void> {
		const contents = this.createFileContents(keys, this.configuration.targetLocale);

		await writeFile(
			this.configuration.destination,
			JSON.stringify(contents, null, 4),
		);
	}

	private createFileContents(keys: Key[], target: OutputLocale): Record<string, string> {
		const output: Record<string, string> = {};
		for (const key of keys) {
			if (!key.translations) {
				throw new Error("Translations property is missing. Have you loaded the data with translations included?");
			}

			const translation = getTranslationFromKey(key, target.tms);
			if (!translation && !this.configuration.useSourceOnEmpty) {
				continue;
			}

			const originalId = getOriginalIdFromKey(key);
			output[originalId] = translation?.translation || (this.configuration.useSourceOnEmpty ? originalId : '');
		}
		return output;
	}
}
