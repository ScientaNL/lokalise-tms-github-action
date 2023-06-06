import { TranslationKey } from "../translation-key.js";

export interface GithubComments {
	removeTranslationsComment(): Promise<void>;

	writeTranslationsToPR(
		keys: TranslationKey[],
	): Promise<void>;
}

