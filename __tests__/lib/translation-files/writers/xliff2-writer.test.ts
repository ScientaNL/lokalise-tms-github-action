import { expect, test } from '@jest/globals';
import { readFile } from "fs/promises";
import { FileTypesEnum } from "../../../../src/lib/configuration/file-types.enum.js";
import { Xliff2Writer } from "../../../../src/lib/translation-files/writers/xliff2-writer.js";

function getKeys() {
	return [
		{
			tmsId: 1,
			tmsKeyName: "tmsKey",
			originalId: "1332434532",
			translations: [
				{
					translation: "This is a test",
					language: "en-US",
				},
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
					translation: "This is a test",
					language: "en-US",
				},
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

test('Simple XLIFF2 with useSourceOnEmpty', async () => {
	const rndPath = `/tmp/writer-${Math.random()}`;

	const writer = new Xliff2Writer({
		destination: rndPath,
		tag: "json",
		sourceLocale: {
			tms: "en-US",
			output: "en-US",
		},
		targetLocale: {
			tms: "nl",
			output: "nl",
		},
		useSourceOnEmpty: true,
		type: FileTypesEnum.XLIFF2,
	});

	await writer.write(getKeys());

	const xliff = await readFile(rndPath, 'utf-8');
	expect(xliff).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US" trgLang="nl">
  <file original="ng.template" id="ngi18n">
    <unit id="1332434532">
      <segment state="final">
        <source>This is a test</source>
        <target>Dit is een test</target>
      </segment>
    </unit>
    <unit id="This is a test">
      <segment state="final">
        <source>This is a test</source>
        <target>This is a test</target>
      </segment>
    </unit>
  </file>
</xliff>
`);
});

test('Simple XLIFF2 with useSourceOnEmpty', async () => {
	const rndPath = `/tmp/writer-${Math.random()}`;

	const writer = new Xliff2Writer({
		destination: rndPath,
		tag: "json",
		sourceLocale: {
			tms: "en-US",
			output: "en-US",
		},
		targetLocale: {
			tms: "nl",
			output: "nl",
		},
		useSourceOnEmpty: false,
		type: FileTypesEnum.XLIFF2,
	});

	await writer.write(getKeys());

	const xliff = await readFile(rndPath, 'utf-8');
	expect(xliff).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US" trgLang="nl">
  <file original="ng.template" id="ngi18n">
    <unit id="1332434532">
      <segment state="final">
        <source>This is a test</source>
        <target>Dit is een test</target>
      </segment>
    </unit>
    <unit id="This is a test">
      <segment state="final">
        <source>This is a test</source>
        <target></target>
      </segment>
    </unit>
  </file>
</xliff>
`);
});

test('XLIFF2 special chars', async () => {
	const rndPath = `/tmp/writer-${Math.random()}`;

	const writer = new Xliff2Writer({
		destination: rndPath,
		tag: "json",
		sourceLocale: {
			tms: "en-US",
			output: "en-US",
		},
		targetLocale: {
			tms: "nl",
			output: "nl",
		},
		useSourceOnEmpty: true,
		type: FileTypesEnum.XLIFF2,
	});

	await writer.write([
		{
			tmsId: 1,
			tmsKeyName: "tmsKey",
			originalId: "1332434532",
			translations: [
				{
					translation: "This is a &lt; test & more ©",
					language: "en-US",
				},
				{
					translation: "Dit is een &gt; test & meer ©",
					language: "nl",
				},
			],
			meaning: "",
			description: "",
			tags: [],
		},
	]);

	const xliff = await readFile(rndPath, 'utf-8');
	expect(xliff).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US" trgLang="nl">
  <file original="ng.template" id="ngi18n">
    <unit id="1332434532">
      <segment state="final">
        <source>This is a &lt; test &amp; more &#xa9;</source>
        <target>Dit is een &gt; test &amp; meer &#xa9;</target>
      </segment>
    </unit>
  </file>
</xliff>
`);
});

test('XLIFF2 placeholder', async () => {
	const rndPath = `/tmp/writer-${Math.random()}`;

	const writer = new Xliff2Writer({
		destination: rndPath,
		tag: "json",
		sourceLocale: {
			tms: "en-US",
			output: "en-US",
		},
		targetLocale: {
			tms: "nl",
			output: "nl",
		},
		useSourceOnEmpty: true,
		type: FileTypesEnum.XLIFF2,
	});

	await writer.write([
		{
			tmsId: 1,
			tmsKeyName: "tmsKey",
			originalId: "1332434532",
			translations: [
				{
					translation: '<ph id="0" equiv="INTERPOLATION" disp="{{groups.length"/> Groups & users',
					language: "en-US",
				},
				{
					translation: '<ph id="0" equiv="INTERPOLATION" disp="{{groups.length"/> Groepen & gebruikers',
					language: "nl",
				},
			],
			meaning: "",
			description: "",
			tags: [],
		},
	]);

	const xliff = await readFile(rndPath, 'utf-8');
	expect(xliff).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US" trgLang="nl">
  <file original="ng.template" id="ngi18n">
    <unit id="1332434532">
      <segment state="final">
        <source><ph id="0" equiv="INTERPOLATION" disp="{{groups.length"/> Groups &amp; users</source>
        <target><ph id="0" equiv="INTERPOLATION" disp="{{groups.length"/> Groepen &amp; gebruikers</target>
      </segment>
    </unit>
  </file>
</xliff>
`);
});

test('XLIFF2 pc', async () => {
	const rndPath = `/tmp/writer-dinge`;

	const writer = new Xliff2Writer({
		destination: rndPath,
		tag: "json",
		sourceLocale: {
			tms: "en-US",
			output: "en-US",
		},
		targetLocale: {
			tms: "nl",
			output: "nl",
		},
		useSourceOnEmpty: true,
		type: FileTypesEnum.XLIFF2,
	});

	await writer.write([
		{
			tmsId: 1,
			tmsKeyName: "tmsKey",
			originalId: "1332434532",
			translations: [
				{
					translation: 'Please <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span class=&quot;login&quot;\n 				(click)=&quot;showLogin(&amp;)&quot;\n 			&gt;" dispEnd="&lt;/span&gt;">Login</pc> to view this widget ',
					language: "en-US",
				},
				{
					translation: 'Please <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span class=&quot;login&quot;\n 				(click)=&quot;showLogin(&amp;)&quot;\n 			&gt;" dispEnd="&lt;/span&gt;">Inloggen</pc> om deze widget te bekijken ',
					language: "nl",
				},
			],
			meaning: "",
			description: "",
			tags: [],
		},
	]);

	const xliff = await readFile(rndPath, 'utf-8');
	expect(xliff).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US" trgLang="nl">
  <file original="ng.template" id="ngi18n">
    <unit id="1332434532">
      <segment state="final">
        <source>Please <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span class=&quot;login&quot;
 \t\t\t\t(click)=&quot;showLogin(&amp;)&quot;
 \t\t\t&gt;" dispEnd="&lt;/span&gt;">Login</pc> to view this widget </source>
        <target>Please <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span class=&quot;login&quot;
 \t\t\t\t(click)=&quot;showLogin(&amp;)&quot;
 \t\t\t&gt;" dispEnd="&lt;/span&gt;">Inloggen</pc> om deze widget te bekijken </target>
      </segment>
    </unit>
  </file>
</xliff>
`);
});
