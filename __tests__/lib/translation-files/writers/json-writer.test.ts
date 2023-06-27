import { expect, test } from '@jest/globals';
import { readFile } from "fs/promises";
import { FileTypesEnum } from "../../../../src/lib/configuration/file-types.enum.js";
import { JsonWriter } from "../../../../src/lib/translation-files/writers/json-writer.js";

function getKeys() {
	return [
		{
			tmsId: 1,
			tmsKeyName: "tmsKey",
			originalId: "1332434532",
			translations: [
				{
					translation: "Dit is een test",
					language: "nl",
				},
			],
			meaning: "",
			description: "",
			tags: [],
		},
		{
			tmsId: 1,
			tmsKeyName: "tmsKey",
			originalId: "This is a test",
			translations: [
				{
					translation: "Ceci est un test",
					language: "fr",
				},
			],
			meaning: "",
			description: "",
			tags: [],
		},
	];
}

test('Simple JSON with useSourceOnEmpty', async () => {
	const rndPath = `/tmp/writer-${Math.random()}`;

	const writer = new JsonWriter({
		destination: rndPath,
		tag: "json",
		sourceLocale: {
			tms: "en_US",
			output: "en-US",
		},
		targetLocale: {
			tms: "nl",
			output: "nl",
		},
		useSourceOnEmpty: true,
		type: FileTypesEnum.JSON,
	});

	await writer.write(getKeys());

	const generatedJSON = JSON.parse(await readFile(rndPath, 'utf-8'));
	expect(generatedJSON).toEqual({
		"1332434532": "Dit is een test",
		"This is a test": "This is a test",
	});
});

test('Simple JSON without useSourceOnEmpty', async () => {
	const rndPath = `/tmp/writer-${Math.random()}`;

	const writer = new JsonWriter({
		destination: rndPath,
		tag: "json",
		sourceLocale: {
			tms: "en_US",
			output: "en-US",
		},
		targetLocale: {
			tms: "nl",
			output: "nl",
		},
		useSourceOnEmpty: false,
		type: FileTypesEnum.JSON,
	});

	await writer.write(getKeys());

	const generatedJSON = JSON.parse(await readFile(rndPath, 'utf-8'));
	expect(generatedJSON).toEqual({
		"1332434532": "Dit is een test",
	});
});
