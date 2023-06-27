export interface ExtractedKey<SNAPSHOTDATA = unknown> {
	keyId: string;
	originalId: string;
	term: string;
	srcLang: string;
	description?: string | null;
	meaning?: string | null;
	snapshotData?: SNAPSHOTDATA;
}

export interface TMSKey {
	tmsId: number;
	tmsKeyName: string;
	description: string;
	tags: string[];
	meaning: string;
	originalId: string;
}

export interface TMSKeyWithTranslations extends TMSKey {
	translations: TMSTranslation[];
}

export interface TMSTranslation {
	language: string;
	translation: string;
}
