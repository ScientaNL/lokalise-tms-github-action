import { extname } from "path";
import { JsonReader } from "./readers/json-reader.js";
import { TermsReaderInterface } from "./readers/terms-reader.interface.js";
import { Xliff2Reader } from "./readers/xliff2-reader.js";

export class ReaderFactory {
	public static factory(path: string): TermsReaderInterface {

		switch (extname(path)) {
			case ".xlf":
				return new Xliff2Reader(path);
			case ".json":
				return new JsonReader(path);
			default:
				throw new Error(`invalid file type. Could not parse ${path}`);
		}
	}
}
