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
					"pr-id": this.prId,
					terms: terms,
				},
			}),
		);
	}

	public async downloadTranslations(): Promise<CreateKeyData[]> {
		const response = await this.documentClient.send(
			new GetCommand({
				TableName: this.tableName,
				Key: {
					"pr-id": this.prId,
				}
			}),
		);

		return response.Item?.terms ?? [];
	}
}
