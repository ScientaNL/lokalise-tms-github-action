import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SnapshotData } from "../snapshot.js";
import { TranslationKey } from "../translation-key.js";

export class Storage {
	constructor(
		private readonly documentClient: DynamoDBDocumentClient,
		private readonly tableName: string,
		private readonly prId: number,
	) {
	}

	public async uploadTranslations(keys: TranslationKey[]): Promise<void> {
		await this.documentClient.send(
			new PutCommand({
				TableName: this.tableName,
				Item: {
					"pr-id": this.prId,
					terms: keys,
				},
			}),
		);
	}

	public async downloadTranslations(): Promise<TranslationKey<SnapshotData>[]> {
		const response = await this.documentClient.send(
			new GetCommand({
				TableName: this.tableName,
				Key: {
					"pr-id": this.prId,
				},
			}),
		);

		return response.Item?.terms ?? [];
	}

	public async removeTranslations() {
		await this.documentClient.send(
			new DeleteCommand({
				TableName: this.tableName,
				Key: {
					"pr-id": this.prId,
				},
			}),
		);
	}
}
