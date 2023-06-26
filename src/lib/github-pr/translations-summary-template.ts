import { render } from 'ejs';
import { ExtractedKey } from "../translation-key.js";

/**
 * @see https://github.github.com/gfm/#html-blocks
 */
export class TranslationsSummaryTemplate {

	constructor(
		private readonly template: string,
		private readonly summaryTemplate: string,
	) {
	}

	public createMessage(keys: ExtractedKey[]): string {
		return render(
			this.template,
			{
				keys: keys,
			},
		);
	}

	public createSummary(keys: ExtractedKey[]): string {
		return render(
			this.summaryTemplate,
			{
				keys: keys,
			},
		);
	}
}
