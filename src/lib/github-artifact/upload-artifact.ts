import { ArtifactClient } from "@actions/artifact";
import { outputJson, remove } from "fs-extra";

export async function uploadArtifact(
	artifactClient: ArtifactClient,
	artifactName: string,
	root: string = '/tmp',
): Promise<void> {
	const artifactTmpFileName = `${artifactName}.json`;
	await outputJson(`${root}/${artifactTmpFileName}`, "ik ben de data");

	await artifactClient.uploadArtifact(
		artifactName,
		[`${root}/${artifactTmpFileName}`],
		root,
	);

	await remove(`${root}/${artifactTmpFileName}`);
}
