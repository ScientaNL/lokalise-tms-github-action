import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { CreateKeyData } from "@lokalise/node-api";

export class TranslationArtifacts {
	constructor(
		private readonly documentClient: DynamoDBDocumentClient,
		private readonly tableName: string,
		private readonly prId: number,
	) {
	}

	public async uploadTranslations(terms: CreateKeyData[]): Promise<void> {
		await this.documentClient.send(
			new PutCommand({
				TableName: this.tableName,
				Item: {
					"pr-id": 135,
					NEW_ATTRIBUTE_1: "NEW_ATTRIBUTE_1_VALUE",
				},
			}),
		);

		const a  = await this.documentClient.send(
			new GetCommand({
				TableName: this.tableName,
				Key: {
					"pr-id": 135
				}
			}),
		);
		console.log(a);
	}

	public async downloadTranslations(): Promise<CreateKeyData[]> {
		// const artifactName = this.getArtifactName();
		// const artifactTmpFileName = `${artifactName}.json`;
		//
		// await ensureDir(this.storageRoot);
		//
		// const artifact = await this.artifactClient.downloadArtifact(artifactName, this.storageRoot, {createArtifactFolder: false});
		//
		// return await readJson(`${artifact.downloadPath}/${artifactTmpFileName}`);

		return [];
	}
}
