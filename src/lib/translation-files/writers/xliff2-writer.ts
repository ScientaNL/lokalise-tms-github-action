import { encode, EntityLevel } from "entities";
import { XMLBuilder } from "fast-xml-parser";
import { writeFile } from "fs/promises";
import { EventEmitter } from 'node:events';
import { OutputConfiguration } from "../../configuration/configuration.js";
import { TMSKeyWithTranslations } from "../../translation-key.js";
import { TranslationXml } from "../shared/xliff2/translation-xml.js";
import { getTranslationFromKey, TermsWriter, WriterEvents } from "./terms-writer.js";

export class Xliff2Writer implements TermsWriter {
	private readonly xliff2Writer = new XMLBuilder({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		format: true,
		processEntities: false,
	});

	public readonly events: EventEmitter = new EventEmitter();

	constructor(
		private readonly configuration: OutputConfiguration,
	) {
	}

	public async write(keys: TMSKeyWithTranslations[]): Promise<void> {
		const contents = this.createFileContents(keys);

		await writeFile(
			this.configuration.destination,
			contents,
		);
	}

	private createFileContents(keys: TMSKeyWithTranslations[]): string {

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

	private createUnit(key: TMSKeyWithTranslations): Record<string, any> {
		let source: string = getTranslationFromKey(key, this.configuration.sourceLocale.tms)?.translation ?? '';
		let target: string = getTranslationFromKey(key, this.configuration.targetLocale.tms)?.translation ?? '';

		try {
			source = this.encodeHtml(source);
		} catch (e) {
			this.events.emit(WriterEvents.warn, `Could not encode source HTML for ${key.tmsKeyName} - ${source} - ${e as Error}`);
			source = '';
		}

		try {
			target = this.encodeHtml(target);
		} catch (e) {
			this.events.emit(
				WriterEvents.warn,
				`Could not encode target HTML for ${key.tmsKeyName} (${this.configuration.targetLocale.tms}) - ${target} - ${e as Error}`,
			);
			target = '';
		}

		return {
			[this.getAttributeName('id')]: key.originalId,
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
