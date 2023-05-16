import { create } from "@actions/artifact";
import { getInput } from "@actions/core";
import { TermsFileConfig } from "../lib/config-parser.js";
import { TranslationArtifacts } from "../lib/github-artifact/translation-artifacts.js";
import { writeTranslationsToPR } from "../lib/github-pr/github-comment.js";
import { SourceTermsLokaliseKeysMerger } from "../lib/lokalise-api/source-terms-lokalise-keys-merger.js";
import { TMSClient } from "../lib/lokalise-api/tms-client.js";
import { TermsContainer } from "../lib/terms-container.js";
import { FileTypesEnum } from "../lib/translation-files/file-types.enum.js";
import { ReaderFactory } from "../lib/translation-files/reader-factory.js";
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, GetCommandOutput, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export class CreateDiffApp {
	private readonly dynamoDBClient = DynamoDBDocumentClient.from(
		new DynamoDBClient({
			credentials: {
				accessKeyId: getInput("dynamoDBAccessKey"),
				secretAccessKey: getInput("dynamoDBSecret"),
			},
			region: getInput("AWSRegion"),
		}),
	);

	private readonly tmsClient = new TMSClient(
		getInput("lokaliseApi"),
		getInput("lokaliseProject"),
	);

	private readonly translationArtifacts = new TranslationArtifacts(
		this.dynamoDBClient,
		getInput("dynamoDBTable"),
		parseInt(getInput('pr_number')),
	);

	constructor(
		private readonly termsFileConfigs: TermsFileConfig[],
	) {
	}

	public async run() {
		const terms = await this.readTerms();

		try {
			const tmsKeys = await this.tmsClient.getProjectkeys();
			const keysDefinition = SourceTermsLokaliseKeysMerger.mergeUnitsInKeys(
				terms.getUnits(),
				tmsKeys,
				getInput("lokaliseSourceLanguageCode"),
			);

			const newKeys = Array.from(keysDefinition.newKeys.values());

			if (!newKeys.length) {
				return;
			}

			await this.translationArtifacts.uploadTranslations(newKeys);
			console.log(234);
			await writeTranslationsToPR(newKeys, `➕ New translations:`);
		} catch (e) {
			console.error(e);
		}
	}

	private async readTerms(): Promise<TermsContainer> {
		const termContainersFilesMap = new Map<TermsContainer, [FileTypesEnum, TermsFileConfig]>();
		for (const config of this.termsFileConfigs) {
			const reader = await ReaderFactory.factory(config.input);

			const termsContainer = await reader.parse();
			termContainersFilesMap.set(termsContainer, [reader.getFileType(), config]);
		}

		const termsContainers = [...termContainersFilesMap.keys()];

		return TermsContainer.merge(...termsContainers);
	}
}
