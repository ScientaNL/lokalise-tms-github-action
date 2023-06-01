import { create } from '@actions/artifact';
import { getOctokit } from '@actions/github';
import { GitHub } from "@actions/github/lib/utils.js";
import { writeFile } from "fs/promises";
import { loadAsync } from 'jszip';
import { rimraf } from "rimraf";
import { temporaryDirectory } from 'tempy';
import { SnapshotData } from "../snapshot.js";
import { TranslationKey } from "../translation-key.js";
import { TranslationStorage } from "./translationStorage.js";

type Artifact = { updated_at: string, id: number };

export class TranslationStorageUsingGithubArtifacts implements TranslationStorage {
	private readonly repositoryParams: { owner: string; repo: string };
	private readonly artifactName: string;

	constructor(
		private readonly github: InstanceType<typeof GitHub>,
		repositoryOwner: string,
		repository: string,
		prNumber: number,
	) {
		this.artifactName = `pr-${prNumber}`;

		this.repositoryParams = {
			owner: repositoryOwner,
			repo: repository,
		};
	}

	public async loadTranslations(): Promise<TranslationKey<SnapshotData>[]> {
		const artifactIds = await this.getArtifactIdsByArtifactName(this.artifactName);

		if (artifactIds.length <= 0) {
			throw new Error(`Could not find artifact ${this.artifactName}`);
		}

		const artifact = await this.github.rest.actions.downloadArtifact({
			...this.repositoryParams,
			artifact_id: artifactIds[0],
			archive_format: 'zip',
		});

		if (!(artifact.data instanceof ArrayBuffer)) {
			throw new Error("Invalid response while downloading artifact");
		}

		const file = (await loadAsync(artifact.data)).file(this.artifactName);
		if (!file) {
			throw new Error("Could not find artifact file");
		}

		const json = await file.async('string');

		return JSON.parse(json) as TranslationKey<SnapshotData>[];
	}

	public async removeTranslations(): Promise<void> {
		const artifactIds = await this.getArtifactIdsByArtifactName(this.artifactName);
		for (const artifactId of artifactIds) {
			await this.deleteArtifactByArtifactId(artifactId);
		}
	}

	public async saveTranslations(keys: TranslationKey[]): Promise<void> {
		const tempDir = temporaryDirectory();
		const path = `${tempDir}/${this.artifactName}`;

		await writeFile(path, JSON.stringify(keys));

		const githubArtifactClient = create();
		const response = await githubArtifactClient.uploadArtifact(
			this.artifactName,
			[path],
			tempDir,
			{
				continueOnError: false,
			},
		);

		if (response.failedItems.length) {
			throw new Error(`Could not upload artifact ${this.artifactName}`);
		}

		await rimraf(tempDir);
	}

	private async getArtifactIdsByArtifactName(artifactName: string): Promise<number[]> {
		const perPage = 100;
		let artifacts: Artifact[] = [];
		let page = 0;

		do {
			const response = await this.github.rest.actions.listArtifactsForRepo({
				...this.repositoryParams,
				per_page: perPage,
				page: ++page,
				name: artifactName,
			});

			artifacts = [...artifacts, ...response.data.artifacts as Artifact[]];

			if (perPage * page >= response.data.total_count) {
				break;
			}
		} while (true);

		return artifacts.sort(
			(a, b) => new Date(b.updated_at as string).getTime() - new Date(a.updated_at as string).getTime(),
		).map(({id}) => id);
	}

	private async deleteArtifactByArtifactId(artifactId: number): Promise<void> {
		await this.github.rest.actions.deleteArtifact({
			...this.repositoryParams,
			artifact_id: artifactId,
		});
	}
}
