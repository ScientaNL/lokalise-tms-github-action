import { TranslationUnit } from "./translation-unit.js";

export class TermsContainer {
	private readonly unitMap = new Map<string, TranslationUnit>();

	constructor(
		private readonly sourceLanguage: string,
		private readonly path: string | null = null,
	) {
	}

	public addOrMergeUnit(sourceId: string, unit: TranslationUnit): void {
		const normalizedId = unit.getNormalizedId();

		if (this.unitMap.has(normalizedId)) {
			const destinationUnit = this.unitMap.get(normalizedId) as TranslationUnit;
			destinationUnit.merge(unit);
		} else {
			this.unitMap.set(normalizedId, unit);
		}
	}

	public getUnits(): TranslationUnit[] {
		return Array.from(this.unitMap.values());
	}

	public containsUnitByNormalizedId(normalizedId: string): boolean {
		return this.unitMap.has(normalizedId);
	}

	/**
	 * Get a translation unit by identifier. This couldbe either a sourceId or a normalizedId
	 *
	 * @param unitId
	 */
	public getUnitById(unitId: string): TranslationUnit {
		if (!this.containsUnitByNormalizedId(unitId)) {
			throw new Error(`Could not find unit with unit ID ${unitId}. Are you providing either a sourceId or a normalizedId`);
		}

		return this.unitMap.get(unitId) as TranslationUnit;
	}

	public static merge(...sources: TermsContainer[]): TermsContainer {
		if (!sources.length) {
			throw new Error("No containers to merge");
		}

		if ((new Set(sources.map(({sourceLanguage}) => sourceLanguage))).size !== 1) {
			throw new Error("Not all sources are from the same source language");
		}

		const destination = new TermsContainer(sources[0].sourceLanguage);

		for (const container of sources) {
			for (const unit of container.getUnits()) {
				destination.addOrMergeUnit(unit.getNormalizedId(), unit.clone());
			}
		}

		return destination;
	}
}
