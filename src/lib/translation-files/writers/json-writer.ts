import { writeFile } from "fs/promises";
import { TermsFileConfig } from "../../config-parser.js";
import { TermsContainer } from "../../terms-container.js";
import { JsonReader } from "../readers/json-reader.js";
import { TermsWriteInterface } from "./terms-write.interface.js";

interface JsonInput {
	srcLang: string;
	units: {
		term: string,
		location: string,
	}[];
}

export class JsonWriter implements TermsWriteInterface {
	constructor(
		private readonly termsContainer: TermsContainer,
		private readonly termsFileConfig: TermsFileConfig,
	) {
	}

	public async writeForLocale(locale: string): Promise<void> {
		const unitsDefinition = await JsonReader.readJsonFile(this.termsFileConfig.input);

		const translationMap: Record<string, string | null> = {};
		for (const unit of unitsDefinition.units) {
			translationMap[unit.term] = this.termsContainer.getUnitById(unit.term).getTranslation(locale);
		}

		await writeFile(`${this.termsFileConfig.destination}/${locale}.json`, JSON.stringify(translationMap, null, 4));
	}
}
