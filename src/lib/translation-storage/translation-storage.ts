import { SnapshotData } from "../snapshot.js";
import { ExtractedKey } from "../translation-key.js";

export interface TranslationStorage {
	saveTranslations(keys: ExtractedKey[]): Promise<void> ;
	loadTranslations(): Promise<ExtractedKey<SnapshotData>[]> ;
	removeTranslations(): Promise<void> ;
}
