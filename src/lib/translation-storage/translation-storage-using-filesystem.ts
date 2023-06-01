import { info } from "@actions/core";
import { readFile, unlink, writeFile } from "fs/promises";
import { loadAsync } from 'jszip';
import { SnapshotData } from "../snapshot.js";
import { TranslationKey } from "../translation-key.js";
import { TranslationStorage } from "./translationStorage.js";

type Artifact = { updated_at: string, id: number };

export class TranslationStorageUsingFilesystem implements TranslationStorage {
	private readonly artifactName: string;
	private readonly artifactPath: string;

	constructor(
		path: string,
		prNumber: number,
	) {
		this.artifactName = `pr-${prNumber}`;
		this.artifactPath = `${path}/${this.artifactName}`;
	}

	public async loadTranslations(): Promise<TranslationKey<SnapshotData>[]> {
		return JSON.parse(
			await readFile(this.artifactPath, 'utf-8'),
		) as TranslationKey<SnapshotData>[];
	}

	public async removeTranslations(): Promise<void> {
		await unlink(this.artifactPath);
	}

	public async saveTranslations(keys: TranslationKey[]): Promise<void> {
		await writeFile(this.artifactPath, JSON.stringify(keys));
		info(`Write translations to ${this.artifactPath}`);
	}
}
