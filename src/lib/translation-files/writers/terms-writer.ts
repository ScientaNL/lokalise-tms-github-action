import { EventEmitter } from "node:events";
import { TMSKeyWithTranslations, TMSTranslation } from "../../translation-key.js";

export interface TermsWriter {
	events: EventEmitter;

	write(keys: TMSKeyWithTranslations[]): Promise<void>;
}

export enum WriterEvents {
	warn = 'warn',
}

export function getTranslationFromKey(key: TMSKeyWithTranslations, language: string): TMSTranslation | undefined {
	return key.translations.find((key) => key.language === language);
}
