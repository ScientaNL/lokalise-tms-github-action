import { readFile } from "fs/promises";
import { parse as parseYaml } from "yaml";
import { Configuration, configValidator } from "./configuration.js";

export async function loadConfig(rcPath: string): Promise<Configuration> {
	const validatedConfig = configValidator.validate(
		parseYaml(
			await readFile(rcPath, 'utf-8'),
		),
	);

	if (validatedConfig.error instanceof Error) {
		throw validatedConfig.error;
	}

	return validatedConfig.value;
}
