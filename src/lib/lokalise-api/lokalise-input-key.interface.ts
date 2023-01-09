export interface LokaliseInputKeyInterface {
	key_name: string;
	description?: string;
	context?: string;
	platforms: ("web")[];
	fileNames?: Record<string, string>;
	translations: {
		language_iso: string,
		translation: string,
	}[];
	is_plural?: boolean;
	custom_attributes?: any;
}
