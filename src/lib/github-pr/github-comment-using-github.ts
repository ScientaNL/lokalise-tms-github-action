import { GitHub } from "@actions/github/lib/utils.js";
import { TranslationKey } from "../translation-key.js";
import { GithubComments } from "./github-comment.js";
import { TranslationsSummaryTemplate } from "./translations-summary-template.js";

interface Comment {
	id: number;
	user: {
		login: string;
	};
	body: string;
}

export class GithubCommentsUsingGithub implements GithubComments {
	private readonly commentMarker = `<!-- ScientaNL/lokalise-tms-github-action::translations -->`;
	constructor(
		private readonly octokit: InstanceType<typeof GitHub>,
		private readonly owner: string,
		private readonly repository: string,
		private readonly prId: number,
		private readonly templateEngine: TranslationsSummaryTemplate,
	) {
	}

	public async removeTranslationsComment(): Promise<void> {
		const prComments: { data: Comment[] } = await this.octokit.rest.issues.listComments({
			owner: this.owner,
			repo: this.repository,
			issue_number: this.prId,
		}) as any;

		const translationsComment = this.findTranslationsComment(prComments.data);

		if (!translationsComment) {
			return;
		}

		await this.octokit.rest.issues.deleteComment({
			owner: this.owner,
			repo: this.repository,
			comment_id: translationsComment.id,
		});
	}

	private findTranslationsComment(comments: Comment[]): Comment | undefined {
		return comments.find(
			(comment) => comment.body.includes(this.commentMarker),
		);
	}

	public async writeTranslationsToPR(keys: TranslationKey[]): Promise<void> {
		let commentText = this.templateEngine.createMessage(keys);

		if (commentText.length >= 65536 - this.commentMarker.length) {
			commentText = this.templateEngine.createSummary(keys);
		}

		commentText = `${this.commentMarker}\n${commentText}`;

		const prComments: { data: Comment[] } = await this.octokit.rest.issues.listComments({
			owner: this.owner,
			repo: this.repository,
			issue_number: this.prId,
		}) as any;

		const translationsComment = this.findTranslationsComment(prComments.data);

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
}

