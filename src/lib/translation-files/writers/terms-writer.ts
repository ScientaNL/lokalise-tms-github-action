import { Key, Translation } from "@lokalise/node-api";

export interface TermsWriter {
	write(keys: Key[]): Promise<void>;
}

export function getOriginalIdFromKey(key: Key): string {
	if (typeof key.custom_attributes !== "string") {
		throw new Error("Invalid custom attributes set to key");
	}

	const customAttributes = JSON.parse(key.custom_attributes) as Record<string, any>;

	if (!customAttributes?.originalId) {
		throw new Error("No originalId set to TMS key");
	}

	return customAttributes.originalId;
}

export function getTranslationFromKey(key: Key, language: string): Translation | undefined {
	return key.translations.find(({language_iso}) => language_iso === language);
}
