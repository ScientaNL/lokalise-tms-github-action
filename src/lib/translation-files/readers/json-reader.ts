// import { TranslationMessagesFileFactory } from "@ngx-i18nsupport/ngx-i18nsupport-lib";
// import { ITranslationMessagesFile } from "@ngx-i18nsupport/ngx-i18nsupport-lib/src/api/i-translation-messages-file.js";
import { readFile } from "fs/promises";
import { FileTypesEnum } from "../file-types.enum.js";
import { TermsContainer } from "../../terms-container.js";
import { TranslationUnit } from "../../translation-unit.js";
import { TermsReaderInterface } from "./terms-reader.interface.js";

interface JsonInput {
	srcLang: string;
	units: {
		term: string,
		location: string,
	}[];
}

export class JsonReader implements TermsReaderInterface {
	constructor(
		private readonly inputPath: string,
	) {
	}

	public async parse(): Promise<TermsContainer> {
		const contents: JsonInput = await JsonReader.readJsonFile(this.inputPath);

		if (!contents?.units || !contents?.srcLang) {
			throw new Error("Invalid json");
		}

		const container = new TermsContainer(contents.srcLang, this.inputPath);
		for (const inputUnit of contents.units) {
			const unit = new TranslationUnit(inputUnit.term.trim());
			unit.addLocation(inputUnit.location);
			unit.addOriginalId(inputUnit.term);

			container.addOrMergeUnit(inputUnit.term, unit);
		}

		return container;
	}

	public getFileType(): FileTypesEnum {
		return FileTypesEnum.JSON;
	}

	public static async readJsonFile(inputPath: string): Promise<JsonInput> {
		return JSON.parse(await readFile(inputPath, "utf-8"));
	}
}
