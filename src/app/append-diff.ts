import { create } from "@actions/artifact";
import { getInput } from "@actions/core";
import { TranslationArtifacts } from "../lib/github-artifact/translation-artifacts.js";
import { TMSClient } from "../lib/lokalise-api/tms-client.js";

export class AppendDiffApp {
	private readonly artifactClient = create();

	private readonly tmsClient = new TMSClient(
		getInput("lokaliseApi"),
		getInput("lokaliseProject"),
	);

	private readonly translationArtifacts = new TranslationArtifacts(
		this.artifactClient,
		parseInt(getInput('pr_number')),
	);

	public async run(): Promise<void> {
		try {
			const translations = await this.translationArtifacts.downloadTranslations();
			console.log(translations);

			// await this.tmsClient.createProjectKeys(
			// 	Array.from(keysDefinition.newKeys.values()),
			// );
		} catch (e) {
			console.log(e);
		}
	}
}
