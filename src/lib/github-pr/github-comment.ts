import { getInput } from "@actions/core";
import { getOctokit } from "@actions/github";

interface Comment {
	id: number;
	user: {
		login: string;
	};
	body: string;
}


export async function writeTranslationsToPR() {
	const octokit = getOctokit(getInput('token'));

	const prId = parseInt(getInput('pr_number'));
	const owner = getInput("owner");
	const repo = getInput("repo");

	const prComments: { data: Comment[] } = await octokit.rest.issues.listComments({
		owner,
		repo,
		issue_number: prId,
	}) as any;

	const translationsComment = prComments.data.find(
		(comment) => comment.user.login === 'github-actions[bot]' && comment.body.includes("Translations: "),
	);

	if (translationsComment) {
		await octokit.rest.issues.updateComment({
			owner: owner,
			repo: repo,
			comment_id: translationsComment.id,
			body: 'Translations: ' + Math.random(),
		});
	} else {
		await octokit.rest.issues.createComment({
			owner: owner,
			repo: repo,
			issue_number: prId,
			body: 'Translations: ' + Math.random(),
		});
	}
}
