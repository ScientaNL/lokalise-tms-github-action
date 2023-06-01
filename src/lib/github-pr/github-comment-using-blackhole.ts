import { TranslationKey } from "../translation-key.js";
import { GithubComments } from "./github-comment.js";

interface Comment {
	id: number;
	user: {
		login: string;
	};
	body: string;
}

export class GithubCommentsUsingMock implements GithubComments {
	public async removeTranslationsComment(summaryText: string): Promise<void> {
		console.log("Move remove PR comment");
	}

	public async writeTranslationsToPR(
		keys: TranslationKey[],
		summaryText: string,
	): Promise<void> {
		console.log("Mock write translations to PR comments");
	}
}

