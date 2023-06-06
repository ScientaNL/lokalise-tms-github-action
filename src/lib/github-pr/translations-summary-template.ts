import { render } from 'ejs';
import { TranslationKey } from "../translation-key.js";

/**
 * @see https://github.github.com/gfm/#html-blocks
 */
export class TranslationsSummaryTemplate {

	constructor(
		private readonly template: string,
		private readonly summaryTemplate: string,
	) {
	}

	public createMessage(keys: TranslationKey[]): string {
		return render(
			this.template,
			{
				keys: keys,
			},
		);
	}

	public createSummary(keys: TranslationKey[]): string {
		return render(
			this.summaryTemplate,
			{
				keys: keys,
			},
		);
	}
}
