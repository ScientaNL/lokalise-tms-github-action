import { getInput } from "@actions/core";
import { getOctokit } from "@actions/github";
import { CreateKeyData } from "@lokalise/node-api";

interface Comment {
	id: number;
	user: {
		login: string;
	};
	body: string;
}

export async function writeTranslationsToPR(
	keys: CreateKeyData[],
	summaryText: string,
) {
	const octokit = getOctokit(getInput('token'));

	const prId = parseInt(getInput('pr_number'));
	const owner = getInput("owner");
	const repo = getInput("repo");

	const commentText = createPRCommentBody(keys, summaryText);

	const prComments: { data: Comment[] } = await octokit.rest.issues.listComments({
		owner,
		repo,
		issue_number: prId,
	}) as any;

	const translationsComment = prComments.data.find(
		(comment) => comment.user.login === 'github-actions[bot]' && comment.body.includes(summaryText),
	);

	if (translationsComment) {
		await octokit.rest.issues.updateComment({
			owner: owner,
			repo: repo,
			comment_id: translationsComment.id,
			body: commentText,
		});
	} else {
		await octokit.rest.issues.createComment({
			owner: owner,
			repo: repo,
			issue_number: prId,
			body: commentText,
		});
	}
}

function createPRCommentBody(
	keys: CreateKeyData[],
	summaryText: string,
): string {
	const terms = keys.map(
		({translations}) => translations
			?.filter(({language_iso, translation}) => language_iso === "source" && !!translation)
			?.map(({translation}) => translation)
			?.map((translation) => `- ${translation}`),
	);

	return `
<details>
<summary>${summaryText}</summary>

${terms.join('\n')}
</details>
	`;
}
