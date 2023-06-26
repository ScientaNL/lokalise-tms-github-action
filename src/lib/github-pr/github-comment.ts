import { ExtractedKey } from "../translation-key.js";

export interface GithubComments {
	removeTranslationsComment(): Promise<void>;

	writeTranslationsToPR(
		keys: ExtractedKey[],
	): Promise<void>;
}

