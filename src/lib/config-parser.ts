import { getInput } from "@actions/core";

export interface TermsFileConfig {
	input: string;
	destination: string;
	destinationLocales: string[];
}

export class ConfigParser {
	private constructor() {
	}

	public static parse(): TermsFileConfig[] {
		const trim = (value: string) => value.trim();
		const termsFiles = getInput("terms", {required: true}).split(",").map(trim);
		const destinations = getInput("destinations", {required: true}).split(",").map(trim);
		const destinationLocales = getInput("destinationLocales", {required: true}).split(",").map(trim);

		if (destinations.length > 1 && destinations.length !== termsFiles.length) {
			throw new Error(
				"Amount of destinations does not match with terms. Must be either the same amount of just one destination for all terms",
			);
		}

		if (destinationLocales.length > 1 && destinationLocales.length !== termsFiles.length) {
			throw new Error(
				"Amount of destinations does not match with terms. Must be either the same amount of just one destination for all terms",
			);
		}

		const configs = [];
		for (let i = 0, u = termsFiles.length; i < u; i++) {
			configs.push({
				input: termsFiles[i],
				destination: destinations?.[i] ?? destinations[0],
				destinationLocales: (destinationLocales?.[i] ?? destinationLocales[0]).toString().split("|").map(trim),
			});
		}

		return configs;
	}
}
