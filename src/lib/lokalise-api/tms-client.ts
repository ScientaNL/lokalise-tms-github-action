import { BulkResult, Key, LokaliseApi, PaginatedResult, CreateKeyData } from "@lokalise/node-api";

export class TMSClient {
	private readonly api: LokaliseApi;
	private readonly limit: number = 500;

	constructor(
		apiKey: string,
		private readonly projectId: string,
	) {
		this.api = new LokaliseApi({
			apiKey: apiKey,
		});
	}

	public async getProjectkeys(): Promise<Map<string, Key>> {
		const resultMap = new Map<string, Key>();

		let cursor: PaginatedResult<Key> | undefined = undefined;
		do {
			cursor = await this.api.keys().list({
				project_id: this.projectId,
				page: cursor ? cursor.nextPage() : 1,
				limit: this.limit,
			});

			for (const key of cursor.items) {
				resultMap.set(TMSClient.getKeyNameFromKey(key), key);
			}
		} while (cursor.hasNextPage());

		return resultMap;
	}

	// public async saveProjectKeys() {
	// 	return await this.api.keys().bulk_update(
	// 		[
	// 			{
	// 				"key_id": 331224,
	// 				"key_name": "index.hello",
	// 				"description": "Index greetings",
	// 				"platforms": [
	// 					"web"
	// 				]
	// 			}
	// 		], {
	// 			project_id: this.projectId,
	//
	// 		}
	// 	);
	// }

	private static getKeyNameFromKey(key: Key): string {
		if (!key.platforms.length) {
			throw new Error("No platform set to key");
		}

		return key.key_name[key.platforms[0]] as string;
	}

	public async createProjectKeys(keys: CreateKeyData[]): Promise<BulkResult<Key>> {

		const aggregatedBulkResult: BulkResult<Key> = {items: [], errors: []};

		if (!keys.length) {
			return aggregatedBulkResult;
		}

		do {
			const slice = keys.splice(0, this.limit);
			const bulkResult = await this.api.keys().create(
				{
					keys: slice,
				},
				{
					project_id: this.projectId,
				},
			);
			aggregatedBulkResult.items.push(...bulkResult.items);
			aggregatedBulkResult.errors.push(...bulkResult.errors);
		} while (keys.length);

		return aggregatedBulkResult;
	}

	//
	// public async deleteProjectKeys(keys: Key[]) {
	// 	if(keys.length <= 0) {
	// 		throw new Error("Could not delete nothing");
	// 	}
	//
	// 	return await this.api.keys().bulk_delete(
	// 		keys.map((key) => key.key_id),
	// 		{
	// 			project_id: this.projectId,
	// 			page: 1,
	// 			limit: 500,
	// 		},
	// 	);
	// }
}
