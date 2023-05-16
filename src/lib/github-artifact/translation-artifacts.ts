import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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
			new UpdateCommand({
				TableName: this.tableName,
				Key: {
					id: this.prId,
				},
				ExpressionAttributeNames: {
					"#terms": "terms",
				},
				UpdateExpression: "set coverage.#terms = :terms",
				ExpressionAttributeValues: {
					":terms": terms,
				},
			}),
		);
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
