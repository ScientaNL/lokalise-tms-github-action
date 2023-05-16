import { ArtifactClient } from "@actions/artifact";
import { CreateKeyData } from "@lokalise/node-api";
import { ensureDir, outputJson, readJson, remove } from "fs-extra";

export class TranslationArtifacts {
	constructor(
		private readonly artifactClient: ArtifactClient,
		private readonly prId: number,
		private readonly storageRoot: string = '/tmp',
	) {
	}

	public async uploadTranslations(translations: CreateKeyData[]): Promise<void> {
		const artifactName = this.getArtifactName();

		const artifactTmpFileName = `${artifactName}.json`;
		await outputJson(`${this.storageRoot}/${artifactTmpFileName}`, translations);

		await this.artifactClient.uploadArtifact(
			artifactName,
			[`${this.storageRoot}/${artifactTmpFileName}`],
			this.storageRoot,
		);

		await remove(`${this.storageRoot}/${artifactTmpFileName}`);
	}

	private getArtifactName() {
		return `translations-${this.prId}`;
	}

	public async downloadTranslations(): Promise<CreateKeyData[]> {
		const artifactName = this.getArtifactName();
		const artifactTmpFileName = `${artifactName}.json`;

		await ensureDir(this.storageRoot);

		const artifact = await this.artifactClient.downloadArtifact(artifactName, this.storageRoot, {createArtifactFolder: false});

		return await readJson(`${artifact.downloadPath}/${artifactTmpFileName}`);
	}
}
