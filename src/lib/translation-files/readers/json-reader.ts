import { createHash } from "crypto";
import { ExtractedKey } from "../../translation-key.js";
import { TermsReader } from "./terms-reader.js";

interface JsonInput {
	srcLang: string;
	units: {
		term: string,
		location: string,
		meaning?: string | null,
	}[];
}

export class JsonReader implements TermsReader {
	public parse(input: string): ExtractedKey[] {
		const contents: JsonInput = this.parseJson(input);

		if (!contents?.units || !contents?.srcLang) {
			throw new Error("Invalid json");
		}

		const keys: ExtractedKey[] = [];
		for (const inputKey of contents.units) {
			keys.push({
				keyId: createHash("md5").update(inputKey.term).digest('hex'),
				originalId: inputKey.term,
				term: inputKey.term,
				srcLang: contents.srcLang,
				description: null,
				meaning: null,
			});
		}

		return keys;
	}

	private parseJson(inputPath: string): JsonInput {
		return JSON.parse(inputPath);
	}
}
