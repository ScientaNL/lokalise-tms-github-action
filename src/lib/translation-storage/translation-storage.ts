import { SnapshotData } from "../snapshot.js";
import { ExtractedKey } from "../translation-key.js";

export interface TranslationStorage {
	saveTerms(keys: ExtractedKey<SnapshotData>[]): Promise<void> ;
	loadTerms(): Promise<ExtractedKey<SnapshotData>[]> ;
	removeTerms(): Promise<void> ;
}
