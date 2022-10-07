import { TranslationKey } from "../../translation-key.js";

export interface TermsReader {
	parse(input: string): TranslationKey[];
}
