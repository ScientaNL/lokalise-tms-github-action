import { createHash } from "crypto";

type TranslationsType = Record<string, string>;

export class TranslationUnit {
	private readonly locations = new Set<string>();
	private readonly originalIds = new Set<string>();

	private translations: TranslationsType = {};

	constructor(
		private readonly term: string,
		private readonly description: string | null = null,
		private readonly meaning: string | null = null,
	) {
		this.term = term.trim();

		if (typeof description === "string") {
			this.description = description.trim();
		}

		if (typeof meaning === "string") {
			this.meaning = meaning.trim();
		}
	}

	public getNormalizedId(): string {
		return createHash("md5").update(`${this.meaning ?? ''}@@${this.description ?? ''}@@${this.term ?? ''}`).digest('hex');
	}

	public addLocation(location: string) {
		this.locations.add(location.trim());
	}

	public getLocations(): string[] {
		return Array.from(this.locations);
	}

	public addOriginalId(originalId: string) {
		this.originalIds.add(originalId);
	}

	public getOriginalIds(): string[] {
		return Array.from(this.originalIds);
	}

	public getDescription(): string {
		return this.description ?? '';
	}

	public getMeaning(): string {
		return this.meaning ?? '';
	}

	public getTerm(): string {
		return this.term;
	}

	public setTranslations(translations: TranslationsType): void {
		this.translations = translations;
	}

	public getTranslations(): TranslationsType {
		return this.translations;
	}

	public setTranslation(locale: string, translation: string) {
		this.translations[locale] = translation;
	}

	public getTranslation(locale: string): string | null {
		return this.translations[locale] ?? null;
	}

	public merge(unit: TranslationUnit): void {
		for (const location of unit.locations) {
			this.addLocation(location);
		}

		for (const originalId of unit.originalIds) {
			this.addOriginalId(originalId);
		}
	}

	public clone(): TranslationUnit {
		const clone = new TranslationUnit(
			this.term,
			this.description,
			this.meaning,
		);

		this.locations.forEach((location) => clone.addLocation(location));
		this.originalIds.forEach((id) => clone.addOriginalId(id));

		return clone;
	}
}
