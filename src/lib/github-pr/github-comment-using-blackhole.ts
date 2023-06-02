import { TranslationKey } from "../translation-key.js";
import { GithubComments } from "./github-comment.js";
import { TranslationsMarkdownFormatter } from "./translations-markdown-formatter.js";

export class GithubCommentsUsingMock implements GithubComments {
	public async removeTranslationsComment(summaryText: string): Promise<void> {
		console.log("Remove PR comment");
	}

	public async writeTranslationsToPR(
		keys: TranslationKey[],
		summaryText: string,
	): Promise<void> {
		console.log("Mock write translations to PR comments");
		console.log(TranslationsMarkdownFormatter.createMessage(keys, summaryText));
	}
}

