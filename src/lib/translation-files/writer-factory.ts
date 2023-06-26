import { OutputConfiguration } from "../configuration/configuration.js";
import { FileTypesEnum } from "../configuration/file-types.enum.js";
import { JsonWriter } from "./writers/json-writer.js";
import { TermsWriter } from "./writers/terms-writer.js";
import { Xliff2Writer } from "./writers/xliff2-writer.js";

export class WriterFactory {
	public static factory(
		configuration: OutputConfiguration,
	): TermsWriter {
		switch (configuration.type) {
			case FileTypesEnum.XLIFF2:
				return new Xliff2Writer(configuration);
			case FileTypesEnum.JSON:
				return new JsonWriter(configuration);
			default:
				throw new Error(`invalid file type. Could not parse ${configuration.type}`);
		}
	}
}
