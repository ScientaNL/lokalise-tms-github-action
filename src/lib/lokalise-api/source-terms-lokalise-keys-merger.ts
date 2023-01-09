import { CreateKeyData, Key } from "@lokalise/node-api";
import { TranslationUnit } from "../translation-unit.js";

interface UnitTMSKeysDiff {
	newKeys: Map<string, CreateKeyData>;
	existingKeys: Map<string, Key>;
	obsoleteKeys: Map<string, Key>;
}

export class SourceTermsLokaliseKeysMerger {

	public static mergeUnitsInKeys(
		units: TranslationUnit[],
		tmsKeys: Map<string, Key>,
		sourceLanguageCode: string,
	): UnitTMSKeysDiff {
		const normalizedIds = units.map((unit) => unit.getNormalizedId());
		const destinationState: UnitTMSKeysDiff = {
			newKeys: new Map<string, CreateKeyData>(),
			existingKeys: new Map<string, Key>(),
			obsoleteKeys: new Map<string, Key>(),
		};

		for (const unit of units) {
			const normalizedId = unit.getNormalizedId();
			const key = tmsKeys.get(normalizedId);
			if (!key) {
				destinationState.newKeys.set(
					normalizedId,
					SourceTermsLokaliseKeysMerger.createTMSCreateKeyDataFromUnit(unit, sourceLanguageCode)
				);
			} else {
				destinationState.existingKeys.set(normalizedId, key);
			}
		}

		for (const [tmsKey, key] of tmsKeys.entries()) {
			if (!normalizedIds.includes(tmsKey)) {
				destinationState.obsoleteKeys.set(tmsKey, key);
			}
		}

		return destinationState;
	}

	private static createTMSCreateKeyDataFromUnit(unit: TranslationUnit, sourceLanguageCode: string): CreateKeyData {
		return {
			key_name: unit.getNormalizedId(),
			platforms: [
				"web"
			],
			context: unit.getMeaning(),
			description: unit.getDescription(),
			custom_attributes: JSON.stringify(unit.getLocations()),
			translations: [
				{
					language_iso: sourceLanguageCode,
					translation: unit.getTerm(),
				}
			],
		};
	}
}
