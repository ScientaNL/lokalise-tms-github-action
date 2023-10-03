import { decode, encode, EntityLevel } from "entities";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

export type SourceXmlNode = Record<string, SourceXmlNode[]> & {
	'#text'?: string,
	':@'?: Record<string, string>
}

export class TranslationXml {
	private static readonly xmlReader = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		alwaysCreateTextNode: true,
		processEntities: false,
		preserveOrder: true,
		trimValues: false,
	});

	private static readonly xmlWriter = new XMLBuilder({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		preserveOrder: true,
		format: false,
		processEntities: false,
		suppressUnpairedNode: false,
		unpairedTags: ["ph"],
	});

	private constructor() {
	}

	public static stringToXmlTree(xml: string, unpackRoot: boolean = false): SourceXmlNode[] {
		const tree: SourceXmlNode[] = this.xmlReader.parse(xml);

		if (!unpackRoot) {
			return tree;
		}

		if (!tree?.[0]?.root) {
			throw new Error("Could not unpack root. Have you forgotten to add a root node to the input string");
		}

		return tree?.[0].root as SourceXmlNode[];
	}

	public static xmlTreeToString(tree: SourceXmlNode[]): string {
		return this.xmlWriter.build(tree) as string;
	}

	public static traverseTextNodes(
		tree: SourceXmlNode[],
		callback: (textContents: string) => string,
	): void {
		for (const node of tree) {
			if (node['#text']) {
				node['#text'] = callback(node['#text']);
			}

			for (const nodeItem of Object.values(node)) {
				if (Array.isArray(nodeItem)) {
					this.traverseTextNodes(nodeItem, callback);
				}
			}
		}
	}

	public static encode(text: string): string {
		let preparsed = text.replace("&lt;", "<").replace("&gt;", ">");
		return encode(preparsed, EntityLevel.XML);
	}

	public static decode(text: string): string {
		const decoded = decode(text, EntityLevel.HTML);
		return decoded.replace("<", "&lt;").replace(">", "&gt;");
	}
}
