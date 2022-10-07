import { Key } from "@lokalise/node-api";
import { encode, EntityLevel } from "entities";
import { XMLBuilder } from "fast-xml-parser";
import { writeFile } from "fs/promises";
import { OutputConfiguration } from "../../configuration/configuration.js";
import { TranslationXml } from "../shared/xliff2/translation-xml.js";
import { getOriginalIdFromKey, getTranslationFromKey, TermsWriter } from "./terms-writer.js";

export class Xliff2Writer implements TermsWriter {
	private readonly xliff2Writer = new XMLBuilder({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		format: true,
		processEntities: false,
	});

	constructor(
		private readonly configuration: OutputConfiguration,
	) {
	}

	public async write(keys: Key[]): Promise<void> {
		const contents = this.createFileContents(keys);

		await writeFile(
			this.configuration.destination,
			contents,
		);
	}

	private createFileContents(keys: Key[]): string {

		const xmlContent = this.xliff2Writer.build({
			xliff: {
				[this.getAttributeName('version')]: "2.0",
				[this.getAttributeName('xmlns')]: "urn:oasis:names:tc:xliff:document:2.0",
				[this.getAttributeName('srcLang')]: this.configuration.sourceLocale.output,
				[this.getAttributeName('trgLang')]: this.configuration.targetLocale.output,
				file: {
					[this.getAttributeName('original')]: "ng.template",
					[this.getAttributeName('id')]: "ngi18n",
					unit: keys.map((key) => this.createUnit(key)),
				},
			},
		});

		return `<?xml version="1.0" encoding="UTF-8" ?>\n${xmlContent}`;
	}

	private getAttributeName(attributeName: string): string {
		return `@_${attributeName}`;
	}

	private createUnit(key: Key): Record<string, any> {
		const source = this.encodeHtml(
			getTranslationFromKey(key, this.configuration.sourceLocale.tms)?.translation ?? '',
		);

		const target = this.encodeHtml(
			getTranslationFromKey(key, this.configuration.targetLocale.tms)?.translation ?? '',
		);

		return {
			[this.getAttributeName('id')]: getOriginalIdFromKey(key),
			segment: {
				[this.getAttributeName('state')]: 'final',
				source: source,
				target: target || (this.configuration.useSourceOnEmpty ? source : target),
			},
		};
	}

	private encodeHtml(input: string): string {
		const tree = TranslationXml.stringToXmlTree(`<root>${input}</root>`, true);

		TranslationXml.traverseTextNodes(tree, (text) => encode(text, EntityLevel.XML));

		return TranslationXml.xmlTreeToString(tree);
	}
}
