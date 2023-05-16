import { getInput } from "@actions/core";
import { TMSClient } from "../lib/lokalise-api/tms-client.js";

export class AppendDiffApp {
	private readonly tmsClient = new TMSClient(
		getInput("lokaliseApi"),
		getInput("lokaliseProject"),
	);

	public async run(): Promise<void> {
		try {
			// const translations = await this.translationArtifacts.downloadTranslations();
			// console.log(translations);

			// await this.tmsClient.createProjectKeys(
			// 	Array.from(keysDefinition.newKeys.values()),
			// );
		} catch (e) {
			console.log(e);
		}
	}
}
