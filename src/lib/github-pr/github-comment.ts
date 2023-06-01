import { TranslationKey } from "../translation-key.js";

export interface GithubComments {
	removeTranslationsComment(summaryText: string): Promise<void>;

	writeTranslationsToPR(
		keys: TranslationKey[],
		summaryText: string,
	): Promise<void>;
}

