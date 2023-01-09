import { getInput } from "@actions/core";
import { CreateDiffApp } from "./app/create-diff.js";
import { ConfigParser, TermsFileConfig } from "./lib/config-parser.js";
import { SourceTermsLokaliseKeysMerger } from "./lib/lokalise-api/source-terms-lokalise-keys-merger.js";
import { TMSClient } from "./lib/lokalise-api/tms-client.js";
import { TermsContainer } from "./lib/terms-container.js";
import { FileTypesEnum } from "./lib/translation-files/file-types.enum.js";
import { ReaderFactory } from "./lib/translation-files/reader-factory.js";

(async (): Promise<void> => {
	const configs = ConfigParser.parse();

	switch (getInput("mode")) {
		case "createDiff":
			const app = new CreateDiffApp();
			await app.run();
			break;
		case "appendDiff":
			break;
		default:
			throw new Error("Invalid mode configured in the action");
	}

	return;

	const termContainersFilesMap = new Map<TermsContainer, [FileTypesEnum, TermsFileConfig]>();
	for (const config of configs) {
		const reader = await ReaderFactory.factory(config.input);

		const termsContainer = await reader.parse();
		termContainersFilesMap.set(termsContainer, [reader.getFileType(), config]);
	}

	const termsContainers = [...termContainersFilesMap.keys()];

	const merged = TermsContainer.merge(...termsContainers);

	try {
		const client = new TMSClient(getInput("lokaliseApi"), getInput("lokaliseProject"));
		const tmsKeys = await client.getProjectkeys();

		const keysDefinition = SourceTermsLokaliseKeysMerger.mergeUnitsInKeys(
			merged.getUnits(),
			tmsKeys,
			getInput("lokaliseSourceLanguageCode"),
		);

		await client.createProjectKeys(Array.from(keysDefinition.newKeys.values()));
	} catch (e) {
		console.log(e);
	}
})();
