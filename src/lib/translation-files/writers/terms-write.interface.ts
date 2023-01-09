export interface TermsWriteInterface {
	writeForLocale(locale: string): Promise<void>;
}
