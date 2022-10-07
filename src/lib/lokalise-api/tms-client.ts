import { info } from "@actions/core";
import { BulkResult, CreateKeyData, Key, LokaliseApi, PaginatedResult } from "@lokalise/node-api";
import { Configuration } from "../configuration/configuration.js";
import { SnapshotData } from "../snapshot.js";
import { TranslationKey } from "../translation-key.js";

interface InputKeysTMSKeysDiff {
	newKeys: TranslationKey[];
	obsoleteKeys: Key[];
}

export class TMSClient {
	private readonly api: LokaliseApi;
	private readonly limit: number = 500;

	constructor(
		apiKey: string,
		private readonly projectId: string,
		private readonly configuration: Configuration["lokalise"],
	) {
		this.api = new LokaliseApi({
			apiKey: apiKey,
		});
	}

	public async getProjectKeys(
		includeTranslations: boolean = false,
	): Promise<Key[]> {
		let keys: Key[] = [];
		let cursor: PaginatedResult<Key> | undefined = undefined;
		do {
			cursor = await this.api.keys().list({
				project_id: this.projectId,
				page: cursor ? cursor.nextPage() : 1,
				limit: this.limit,
				include_translations: includeTranslations ? 1 : 0,
			});

			keys = [...keys, ...cursor.items];
		} while (cursor.hasNextPage());

		return keys;
	}

	public async addProjectKeys(keys: TranslationKey<SnapshotData>[]): Promise<BulkResult<Key>> {
		const tmsKeys: CreateKeyData[] = keys.map((key) => this.createTMSCreateKeyDataOfTranslation(key));

		const aggregatedBulkResult: BulkResult<Key> = {items: [], errors: []};
		if (!tmsKeys.length) {
			return aggregatedBulkResult;
		}

		let index = 0;
		do {
			const slice = tmsKeys.splice(0, this.limit);

			info(`Create keys: ${index}-${index + slice.length} of ${keys.length}`);

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

			index = index + slice.length;
		} while (tmsKeys.length);

		return aggregatedBulkResult;
	}

	public diffInputKeysWithTMSKeys(
		inputKeys: TranslationKey[],
		tmsKeys: Key[],
	): InputKeysTMSKeysDiff {
		const tmsKeysMap = this.createTMSKeyMap(tmsKeys);

		const diff: InputKeysTMSKeysDiff = {
			newKeys: [],
			obsoleteKeys: [],
		};

		for (const inputKey of inputKeys) {
			if (!tmsKeysMap.has(inputKey.keyId)) {
				diff.newKeys.push(inputKey);
				tmsKeysMap.delete(inputKey.keyId);
			}
		}

		diff.obsoleteKeys = Array.from(tmsKeysMap.values());

		return diff;
	}

	private getKeyNameFromKey(key: Key): string {
		if (!key.platforms.length) {
			throw new Error("No platform set to key");
		}

		return key.key_name[key.platforms[0]] as string;
	}

	private createTMSCreateKeyDataOfTranslation(key: TranslationKey<SnapshotData>): CreateKeyData {
		const snapshotData = key.snapshotData;
		if (!snapshotData) {
			throw new Error("Required snapshot data is missing");
		}

		return {
			key_name: key.keyId,
			platforms: this.configuration.platforms,
			context: key.meaning ?? undefined,
			description: key.description ?? undefined,
			translations: snapshotData.importInLocales.map((locale) => ({
					language_iso: locale,
					translation: key.term,
				}),
			),
			tags: [snapshotData.tag],
			custom_attributes: JSON.stringify({
				"originalId": key.originalId,
			}),
		};
	}

	private createTMSKeyMap(tmsKeys: Key[]): Map<string, Key> {
		const map = new Map<string, Key>();

		for (const key of tmsKeys) {
			map.set(this.getKeyNameFromKey(key), key);
		}

		return map;
	}
}
