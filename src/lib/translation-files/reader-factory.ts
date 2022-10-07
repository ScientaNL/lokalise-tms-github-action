import { FileTypesEnum } from "../configuration/file-types.enum.js";
import { JsonReader } from "./readers/json-reader.js";
import { TermsReader } from "./readers/terms-reader.js";
import { Xliff2Reader } from "./readers/xliff2-reader.js";

export class ReaderFactory {
	public static factory(
		type: FileTypesEnum,
	): TermsReader {
		switch (type) {
			case FileTypesEnum.XLIFF2:
				return new Xliff2Reader();
			case FileTypesEnum.JSON:
				return new JsonReader();
			default:
				throw new Error(`invalid file type.`);
		}
	}
}
