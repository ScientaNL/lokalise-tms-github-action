import { ExtractedKey } from "../translation-key.js";
import { GithubComments } from "./github-comment.js";
import { TranslationsSummaryTemplate } from "./translations-summary-template.js";

export class GithubCommentsUsingMock implements GithubComments {
	constructor(
		private readonly templateEngine: TranslationsSummaryTemplate,
	) {
	}

	public async removeTranslationsComment(): Promise<void> {
		console.log("Remove PR comment");
	}

	public async writeTranslationsToPR(keys: ExtractedKey[]): Promise<void> {
		console.log("Mock write translations to PR comments");
		console.log(this.templateEngine.createMessage(keys));
	}
}

