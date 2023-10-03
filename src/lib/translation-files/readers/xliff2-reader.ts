import { decode, EntityLevel } from "entities";
import { XMLParser } from 'fast-xml-parser';
import { ExtractedKey } from "../../translation-key.js";
import { TranslationXml } from "../shared/xliff2/translation-xml.js";
import { TermsReader } from "./terms-reader.js";

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
	segment: { // Artifact of xml library. The nested data is added to the #text node
		['#text']: Xliff2Segment,
	},
}

interface Xliff2Segment {
	source: {
		['#text']: string,
	},
}

interface Xliff2Note {
	['@_category']: 'location' | 'meaning' | 'description',
	['#text']: string,
}

type SourceXmlNode = {
	[key: string]: SourceXmlNode[],
} & {
	'#text'?: string,
	':@'?: Record<string, string>
}

export class Xliff2Reader implements TermsReader {
	private readonly xliffXmlReader: XMLParser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		alwaysCreateTextNode: true,
		processEntities: false,
		stopNodes: ["*.segment"],
		isArray: (name: string, jpath: string) => {
			return [
				"xliff.file.unit",
				"xliff.file.unit.notes.note",
			].includes(jpath);
		},
		tagValueProcessor: (tagName, tagValue) => {
			if (tagName === 'segment') {
				return this.parseSegment(tagValue);
			}

			return tagValue;
		},
	});

	public parse(input: string): ExtractedKey[] {
		const xmlData: Xliff2File = this.xliffXmlReader.parse(input);

		if (!xmlData?.xliff?.file?.unit || !xmlData?.xliff?.["@_srcLang"]) {
			throw new Error("Invalid xliff xml");
		}

		const keys: ExtractedKey[] = [];
		for (const inputKey of xmlData.xliff.file.unit) {
			if (inputKey.segment["#text"].source["#text"] === undefined) { // Accept empty string
				continue;
			}

			keys.push(
				this.createUnit(
					inputKey,
					xmlData?.xliff?.["@_srcLang"],
				),
			);
		}

		return keys;
	}

	private createUnit(inputUnit: Xliff2Unit, srcLanguage: string): ExtractedKey {
		const {meaning, description} = this.parseNotes(inputUnit?.notes?.note ?? []);

		return {
			keyId: inputUnit["@_id"],
			originalId: inputUnit["@_id"],
			term: inputUnit.segment["#text"].source["#text"],
			meaning: meaning ?? null,
			description: description ?? null,
			srcLang: srcLanguage,
		};
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

	private parseSegment(input: string): Xliff2Segment {
		input = this.dedent(input);

		const segmentParts = TranslationXml.stringToXmlTree(`<root>${input}</root>`, true);
		const source = segmentParts.find((part) => !!part.source)?.source as SourceXmlNode[];

		if (!source) {
			throw new Error(`Could not find source in ${input}`);
		}

		return {
			source: {
				'#text': this.parseSource(source),
			},
		};
	}

	private parseSource(source: SourceXmlNode[]): string {
		TranslationXml.traverseTextNodes(source, (text) => TranslationXml.decode(text));

		return TranslationXml.xmlTreeToString(source);
	}

	private dedent(string: string): string {
		const lines = string.split("\n");

		if (lines?.[0].trim()?.length === 0) {
			lines.splice(0, 1);
		}
		if (lines.length > 0 && lines?.[lines.length - 1].trim()?.length === 0) {
			lines.splice(lines.length - 1, 1);
		}

		const minIndent = Math.min(
			...lines.map((line) => line.match(/^\s+/)?.[0].length ?? 0),
		) ?? 0;

		return lines.map((line) => line.substring(minIndent)).join('\n');
	}
}
