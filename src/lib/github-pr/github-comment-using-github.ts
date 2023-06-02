import { GitHub } from "@actions/github/lib/utils.js";
import { TranslationKey } from "../translation-key.js";
import { GithubComments } from "./github-comment.js";
import { TranslationsMarkdownFormatter } from "./translations-markdown-formatter.js";

interface Comment {
	id: number;
	user: {
		login: string;
	};
	body: string;
}

export class GithubCommentsUsingGithub implements GithubComments {
	constructor(
		private readonly octokit: InstanceType<typeof GitHub>,
		private readonly owner: string,
		private readonly repository: string,
		private readonly prId: number,
	) {
	}

	public async removeTranslationsComment(summaryText: string): Promise<void> {
		const prComments: { data: Comment[] } = await this.octokit.rest.issues.listComments({
			owner: this.owner,
			repo: this.repository,
			issue_number: this.prId,
		}) as any;

		const translationsComment = prComments.data.find(
			(comment) => comment.user.login === 'github-actions[bot]' && comment.body.includes(summaryText),
		);

		if (!translationsComment) {
			return;
		}

		await this.octokit.rest.issues.deleteComment({
			owner: this.owner,
			repo: this.repository,
			comment_id: translationsComment.id,
		});
	}

	public async writeTranslationsToPR(
		keys: TranslationKey[],
		summaryText: string,
	): Promise<void> {
		let commentText = TranslationsMarkdownFormatter.createMessage(keys, summaryText);

		if (commentText.length >= 65536) {
			commentText = TranslationsMarkdownFormatter.createSummary(keys, summaryText);
		}

		const prComments: { data: Comment[] } = await this.octokit.rest.issues.listComments({
			owner: this.owner,
			repo: this.repository,
			issue_number: this.prId,
		}) as any;

		const translationsComment = prComments.data.find(
			(comment) => comment.user.login === 'github-actions[bot]' && comment.body.includes(summaryText),
		);

		if (translationsComment) {
			await this.octokit.rest.issues.updateComment({
				owner: this.owner,
				repo: this.repository,
				comment_id: translationsComment.id,
				body: commentText,
			});
		} else {
			await this.octokit.rest.issues.createComment({
				owner: this.owner,
				repo: this.repository,
				issue_number: this.prId,
				body: commentText,
			});
		}
	}

	private createPRCommentBody(
		keys: TranslationKey[],
		summaryText: string,
	): string {
		return `
<details>
<summary>${summaryText}</summary>

| # | Term
|---|---
${keys.map(({term}, index) => `| ${index + 1} | ${term}`).join('\n')}
</details>
	`;
	}

}

