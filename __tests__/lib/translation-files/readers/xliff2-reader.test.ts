import { expect, test } from '@jest/globals';
import { Xliff2Reader } from "../../../../src/lib/translation-files/readers/xliff2-reader.js";

test('Throws on invalid xml', () => {
	expect(() => {
		const reader = new Xliff2Reader();
		reader.parse("dadas");
	}).toThrow();
});

test('Simple text', () => {
	const reader = new Xliff2Reader();
	const keys = reader.parse(`
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US">
	<file id="ngi18n" original="ng.template">
		<unit id="123321">
			<notes>
				<note category="location">x</note>
			</notes>
			<segment>
				<source>This is a test</source>
			</segment>
		</unit>
	</file>
</xliff>
	`);

	expect(keys[0]?.term).toBe('This is a test');
	expect(keys[0]?.originalId).toBe('123321');
	expect(keys[0]?.keyId).toBe('123321');
	expect(keys[0]?.meaning).toBe(null);
	expect(keys[0]?.description).toBe(null);
	expect(keys[0]?.srcLang).toBe('en-US');
});

test('Html entities decode', () => {
	const reader = new Xliff2Reader();
	const keys = reader.parse(`
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US">
	<file id="ngi18n" original="ng.template">
		<unit id="123321">
			<segment>
				<source>This is a test &amp; more &copy;</source>
			</segment>
		</unit>
	</file>
</xliff>
	`);

	expect(keys[0]?.term).toBe('This is a test & more ©');
});

test('Simple placeholder', () => {
	const reader = new Xliff2Reader();
	const keys = reader.parse(`
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US">
	<file id="ngi18n" original="ng.template">
		<unit id="123321">
			<segment>
				<source><ph id="0" equiv="INTERPOLATION" disp="{{groups.length"/> Groups &amp; users</source>
			</segment>
		</unit>
	</file>
</xliff>
	`);

	expect(keys[0]?.term).toBe('<ph id="0" equiv="INTERPOLATION" disp="{{groups.length"/> Groups & users');
});

test('dedenting', () => {
	const reader = new Xliff2Reader();
	const keys = reader.parse(`
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US">
	<file id="ngi18n" original="ng.template">
		<unit id="123321">
			<segment>
				<source><strong>
					Groups &amp; users
				</strong></source>
			</segment>
		</unit>
	</file>
</xliff>
	`);

	expect(keys[0]?.term).toBe(`<strong>
	Groups & users
</strong>`);
});

test('dedenting', () => {
	const reader = new Xliff2Reader();
	const keys = reader.parse(`
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US">
	<file id="ngi18n" original="ng.template">
		<unit id="123321">
			<notes>
				<note category="location">x</note>
			</notes>
			<segment>
				<source>Please <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span class=&quot;login&quot;
 				(click)=&quot;showLogin(&amp;)&quot;
 			&gt;" dispEnd="&lt;/span&gt;">Login</pc> to view this widget </source>
			</segment>
		</unit>
	</file>
</xliff>
	`);

	expect(keys[0]?.term).toBe(`Please <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span class=&quot;login&quot;
	(click)=&quot;showLogin(&amp;)&quot;
&gt;" dispEnd="&lt;/span&gt;">Login</pc> to view this widget `);
});

test('Html entities in argument', () => {
	const reader = new Xliff2Reader();
	const keys = reader.parse(`
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-US">
	<file id="ngi18n" original="ng.template">
		<unit id="123321">
			<notes>
				<note category="location">x</note>
			</notes>
			<segment>
				<source><pc test="&lt;span class=&quot;login&quot;&amp;&quot;&gt;"></pc></source>
			</segment>
		</unit>
	</file>
</xliff>
	`);

	expect(keys[0]?.term).toBe(`<pc test="&lt;span class=&quot;login&quot;&amp;&quot;&gt;"></pc>`);
});

