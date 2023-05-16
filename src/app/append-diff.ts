import { getInput } from "@actions/core";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { TMSClient } from "../lib/lokalise-api/tms-client.js";
import { Storage } from "../lib/translation-storage/storage.js";

export class AppendDiffApp {
	private readonly dynamoDBClient = DynamoDBDocumentClient.from(
		new DynamoDBClient({
			credentials: {
				accessKeyId: getInput("dynamoDBAccessKey"),
				secretAccessKey: getInput("dynamoDBSecret"),
			},
			region: getInput("AWSRegion"),
		}),
	);

	private readonly tmsClient = new TMSClient(
		getInput("lokaliseApi"),
		getInput("lokaliseProject"),
	);

	private readonly translationArtifacts = new Storage(
		this.dynamoDBClient,
		getInput("dynamoDBTable"),
		parseInt(getInput('pr_number')),
	);

	public async run(): Promise<void> {
		try {
			const translations = await this.translationArtifacts.downloadTranslations();
			console.log(translations);

			await this.tmsClient.createProjectKeys(translations);
		} catch (e) {
			console.log(e);
		}
	}
}
