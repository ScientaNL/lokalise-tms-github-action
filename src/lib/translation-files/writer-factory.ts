import { TermsFileConfig } from "../config-parser.js";
import { FileTypesEnum } from "./file-types.enum.js";
import { TermsContainer } from "../terms-container.js";
import { JsonWriter } from "./writers/json-writer.js";
import { TermsWriteInterface } from "./writers/terms-write.interface.js";
import { Xliff2Writer } from "./writers/xliff2-writer.js";

export class WriterFactory {
	public static factory(termsContainer: TermsContainer, fileType: FileTypesEnum, termsFileConfig: TermsFileConfig): TermsWriteInterface {

		switch (fileType) {
			case FileTypesEnum.XLIFF2:
				return new Xliff2Writer(termsContainer, termsFileConfig);
			case FileTypesEnum.JSON:
				return new JsonWriter(termsContainer, termsFileConfig);
			default:
				throw new Error(`Invalid file type. Could not write ${fileType}`);
		}
	}
}
