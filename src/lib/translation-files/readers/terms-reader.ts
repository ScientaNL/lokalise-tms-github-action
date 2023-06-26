import { ExtractedKey } from "../../translation-key.js";

export interface TermsReader {
	parse(input: string): ExtractedKey[];
}
