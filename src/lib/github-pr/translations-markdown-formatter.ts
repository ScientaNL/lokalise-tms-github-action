import { TranslationKey } from "../translation-key.js";

/**
 * @see https://github.github.com/gfm/#html-blocks
 */
export class TranslationsMarkdownFormatter {
	public static createMessage(
		keys: TranslationKey[],
		heading: string,
	): string {
		return `
<details>
<summary>${heading}</summary>

<table>
<tr>
<th>#</th>
<th>Term</th>
</tr>
${keys.map(({term}, index) => `<tr><td>${index + 1}</td><td><pre><code>${term}</code></pre></td></tr>\n`)}
</table>
</details>
	`;
	}

	public static createSummary(keys: TranslationKey[], heading: string): string {
		return `
<details>
<summary>${heading}</summary>

Translations overview is too big. ${keys.length} translations found.
</details>
	`;
	}
}
