import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
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
		// await this.documentClient.send(
		// 	new PutCommand({
		// 		TableName: this.tableName,
		// 		Item: {
		// 			primaryKey: "VALUE_1", // For example, 'Season': 2
		// 			NEW_ATTRIBUTE_1: "NEW_ATTRIBUTE_1_VALUE", //For example 'Title': 'The Beginning'
		// 		},
		// 	}),
		// );

		const a  = await this.documentClient.send(
			new CreateTableCommand({
				TableName: this.tableName,
				KeySchema: [
					{
						AttributeName: "Artist",
						KeyType: "HASH", //Partition key
					},
					{
						AttributeName: "SongTitle",
						KeyType: "RANGE" //Sort key
					}
				],
				AttributeDefinitions: [
					{
						AttributeName: "Artist",
						AttributeType: "S"
					},
					{
						AttributeName: "SongTitle",
						AttributeType: "S"
					}
				],
				ProvisionedThroughput: {       // Only specified if using provisioned mode
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1
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
