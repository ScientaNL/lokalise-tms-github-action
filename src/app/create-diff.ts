import { create } from "@actions/artifact";
import { getInput } from "@actions/core";
import { context } from "@actions/github";
import { uploadArtifact } from "../lib/github-artifact/upload-artifact.js";
import { writeTranslationsToPR } from "../lib/github-pr/github-comment.js";

export class CreateDiffApp {

	private readonly artifactClient = create();

	constructor() {
	}

	public async run() {
		const prId = parseInt(getInput('pr_number'));
		const artifactName = `translations-${prId}`;

		await uploadArtifact(this.artifactClient, artifactName, {});

		await writeTranslationsToPR();
	}
}
