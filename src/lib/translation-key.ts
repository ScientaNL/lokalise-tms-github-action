export interface TranslationKey<SNAPSHOTDATA = unknown> {
	keyId: string,
	originalId: string,
	term: string,
	srcLang: string,
	description?: string | null,
	meaning?: string | null,
	snapshotData?: SNAPSHOTDATA,
}
