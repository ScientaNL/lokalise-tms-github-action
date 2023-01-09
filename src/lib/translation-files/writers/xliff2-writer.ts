import { XMLBuilder } from "fast-xml-parser";
import { writeFile } from "fs/promises";
import { TermsFileConfig } from "../../config-parser.js";
import { TermsContainer } from "../../terms-container.js";
import { Xliff2Reader } from "../readers/xliff2-reader.js";
import { TermsWriteInterface } from "./terms-write.interface.js";

export class Xliff2Writer implements TermsWriteInterface {
	constructor(
		private readonly termsContainer: TermsContainer,
		private readonly termsFileConfig: TermsFileConfig,
	) {
	}

	public async writeForLocale(locale: string): Promise<void> {

		// const writer = new XMLBuilder({
		// 	ignoreAttributes: false,
		// 	attributeNamePrefix: Xliff2Reader.attributeNamePrefix,
		// 	stopNodes: ["*.source"],
		// 	format: true,
		// 	// @ts-ignore
		// 	// tagValueProcessor: (name: string, value): string | undefined => {
		// 	// 	if(name === 'segment') {
		// 	// 		return value as string;
		// 	// 	}
		// 	// 	return value as string;
		// 	// },
		// 	processEntities: false,
		//
		// });


		// const xliff = await Xliff2Reader.readXliff2File(this.termsFileConfig.input);
		// xliff.setTargetLanguage(locale);
		// xliff.forEachTransUnit((transUnit) => {
		// 	const translation = this.termsContainer.getUnitById(transUnit.id).getTranslation(locale);
		// 	if (translation) {
		// 		transUnit.translate(translation);
		// 	}
		// });
		//
		// const output = xliff.editedContent();
		//
		// await writeFile(`${this.termsFileConfig.destination}/${locale}.xlf`, output);
	}
}
