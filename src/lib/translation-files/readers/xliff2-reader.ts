import { default as dedent } from 'dedent';
import { XMLParser } from 'fast-xml-parser';

import { readFile } from 'fs/promises';
import { TermsContainer } from "../../terms-container.js";
import { TranslationUnit } from "../../translation-unit.js";
import { FileTypesEnum } from "../file-types.enum.js";
import { TermsReaderInterface } from "./terms-reader.interface.js";

interface Xliff2File {
	xliff: {
		['@_srcLang']: string,
		file: Xliff2Data,
	},
}

interface Xliff2Data {
	unit: Xliff2Unit[];
}

interface Xliff2Unit {
	['@_id']: string,
	notes: {
		note: Xliff2Note[],
	},
	segment: {
		source: {
			['#text']: 'string',
		},
	},
}

interface Xliff2Note {
	['@_category']: 'location' | 'meaning' | 'description',
	['#text']: string,
}

export class Xliff2Reader implements TermsReaderInterface {
	private readonly xmlReader: XMLParser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		alwaysCreateTextNode: true,
		processEntities: false,
		stopNodes: ["*.source"],
		tagValueProcessor: (tagName, tagValue) => {
			if (tagName === 'source') {
				return dedent(tagValue);
			}
			return tagValue;
		},
		isArray: (name: string, jpath: string, isLeafNode: boolean, isAttribute: boolean) => {
			return [
				"xliff.file.unit",
				"xliff.file.unit.notes.note",
			].includes(jpath);
		},
	});

	constructor(
		private readonly inputPath: string,
	) {
	}

	public async parse(): Promise<TermsContainer> {
		const xmlData: Xliff2File = this.xmlReader.parse(
			await readFile(this.inputPath),
		);

		if (!xmlData?.xliff?.file?.unit || !xmlData?.xliff?.["@_srcLang"]) {
			throw new Error("Invalid xliff xml");
		}

		const container = new TermsContainer(
			xmlData?.xliff?.["@_srcLang"],
			this.inputPath.trim(),
		);

		for (const xliffUnit of xmlData.xliff.file.unit) {
			if (xliffUnit?.segment?.source?.['#text'] === undefined) { // Accept empty string
				continue;
			}

			container.addOrMergeUnit(xliffUnit['@_id'], this.createUnit(xliffUnit));
		}

		return container;
	}

	private createUnit(inputUnit: Xliff2Unit): TranslationUnit {
		const {locations, meaning, description} = this.parseNotes(inputUnit?.notes?.note ?? []);
		const unit = new TranslationUnit(
			inputUnit.segment.source['#text'],
			description,
			meaning,
		);

		unit.addOriginalId(inputUnit["@_id"]);

		for (const location of locations) {
			unit.addLocation(location);
		}

		return unit;
	}

	private parseNotes(notes: Xliff2Note[]): { description?: string, meaning?: string, locations: string[] } {
		const grouped = notes.reduce(
			(acc, curr) => {
				acc[curr["@_category"]] = [...(acc[curr["@_category"]] ?? []), curr["#text"]];

				return acc;
			},
			{location: [], description: [], meaning: []} as Record<string, string[]>,
		);

		return {
			description: grouped.description?.[0],
			meaning: grouped.meaning?.[0],
			locations: grouped.location,
		};
	}

	public getFileType(): FileTypesEnum {
		return FileTypesEnum.XLIFF2;
	}
}
