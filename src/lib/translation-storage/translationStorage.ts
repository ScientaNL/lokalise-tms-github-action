import { SnapshotData } from "../snapshot.js";
import { TranslationKey } from "../translation-key.js";

export interface TranslationStorage {
	saveTranslations(keys: TranslationKey[]): Promise<void> ;
	loadTranslations(): Promise<TranslationKey<SnapshotData>[]> ;
	removeTranslations(): Promise<void> ;
}
