import { BulkResult, CreateKeyData, Key, LokaliseApi, PaginatedResult } from "@lokalise/node-api";
import { EventEmitter } from "node:events";
import { Configuration } from "../configuration/configuration.js";
import { SnapshotData } from "../snapshot.js";
import { ExtractedKey, TMSKey, TMSKeyWithTranslations } from "../translation-key.js";

interface InputKeysTMSKeysDiff {
	newKeys: ExtractedKey[];
	obsoleteKeys: TMSKey[];
}

export enum TMSEvents {
	warn = 'warn',
	info = 'info',
}

export class TMSClient {
	private readonly api: LokaliseApi;
	private readonly limit: number = 500;

	public readonly events: EventEmitter = new EventEmitter();

	constructor(
		apiKey: string,
		private readonly projectId: string,
		private readonly configuration: Configuration["lokalise"],
	) {
		this.api = new LokaliseApi({
			apiKey: apiKey,
		});
	}

	public async getKeys(): Promise<TMSKey[]> {
		const TMSKeys: TMSKey[] = [];
		for (const lokaliseKey of await this.getLokaliseKeys(false)) {
			try {
				TMSKeys.push(this.createTMSKeyFromLokaliseKey(lokaliseKey));
			} catch (e) {
				this.events.emit(
					TMSEvents.warn,
					`Could not create a TMSKey for ${JSON.stringify(lokaliseKey.key_name)} - skipping the key. ${e}`,
				);
			}
		}

		return TMSKeys;
	}

	public async getKeysWithTranslations(): Promise<TMSKeyWithTranslations[]> {
		const TMSKeys: TMSKeyWithTranslations[] = [];
		for (const lokaliseKey of await this.getLokaliseKeys(true)) {
			try {
				TMSKeys.push({
					...this.createTMSKeyFromLokaliseKey(lokaliseKey),
					translations: lokaliseKey.translations.map((translation) => ({
						language: translation.language_iso,
						translation: translation.translation,
					})),
				});
			} catch (e) {
				this.events.emit(
					TMSEvents.warn,
					`Could not create a TMSKey for ${JSON.stringify(lokaliseKey.key_name)} - skipping the key. ${e}`,
				);
			}
		}
		return TMSKeys;
	}

	private async getLokaliseKeys(
		includeTranslations: boolean,
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

	public async addKeys(keys: ExtractedKey<SnapshotData>[]): Promise<BulkResult<Key>> {
		const tmsKeys: CreateKeyData[] = keys.map((key) => this.createLokaliseCreateKeyDataOfTranslation(key));

		const aggregatedBulkResult: BulkResult<Key> = {items: [], errors: []};
		if (!tmsKeys.length) {
			return aggregatedBulkResult;
		}

		let index = 0;
		do {
			const slice = tmsKeys.splice(0, this.limit);

			this.events.emit(TMSEvents.info, `Create keys: ${index}-${index + slice.length} of ${keys.length}`);

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

	public diffExtractedKeysWithTMSKeys(
		inputKeys: ExtractedKey[],
		tmsKeys: TMSKey[],
	): InputKeysTMSKeysDiff {
		const tmsKeysMap = new Map<string, TMSKey>();

		for (const key of tmsKeys) {
			tmsKeysMap.set(key.originalId, key);
		}

		const diff: InputKeysTMSKeysDiff = {
			newKeys: [],
			obsoleteKeys: [],
		};

		for (const inputKey of inputKeys) {
			if (!tmsKeysMap.has(inputKey.originalId)) {
				diff.newKeys.push(inputKey);
			} else {
				tmsKeysMap.delete(inputKey.originalId);
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

	private createTMSKeyFromLokaliseKey(key: Key): TMSKey {
		if (typeof key.custom_attributes !== "string") {
			throw new Error("Invalid custom attributes set to key");
		}

		let customAttributes;
		try {
			customAttributes = JSON.parse(key.custom_attributes) as Record<string, any>;
		} catch {
			throw new Error("Could not parse custom attributes json");
		}

		if (!customAttributes?.originalId) {
			throw new Error("No originalId set to TMS key");
		}

		return {
			tmsId: key.key_id,
			tmsKeyName: this.getKeyNameFromKey(key),
			description: key.description,
			meaning: key.context,
			tags: key.tags,
			originalId: customAttributes.originalId,
		};
	}

	private createLokaliseCreateKeyDataOfTranslation(key: ExtractedKey<SnapshotData>): CreateKeyData {
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

	public async removeKeys(TMSKeys: TMSKey[]): Promise<{
		project_id: string,
		keys_removed: boolean,
		keys_locked: number,
	}> {
		return await this.api.keys().bulk_delete(
			TMSKeys.map(({tmsId}) => tmsId),
			{
				project_id: this.projectId,
			},
		);
	}

	public async tagKeys(keys: TMSKey[], tagName: string) {
		return await this.api.keys().bulk_update(
			{
				keys: keys.map((key) => ({
						tags: [tagName],
						merge_tags: true,
						key_id: key.tmsId,
					}),
				),
			},
			{
				project_id: this.projectId,
			}
		);
	}
}
