import { expect, test } from '@jest/globals';
import { JsonReader } from "../../../../src/lib/translation-files/readers/json-reader.js";

test('Throws on invalid json', () => {
	expect(() => {
		const reader = new JsonReader();
		reader.parse("dadas");
	}).toThrow();
});

test('Simple text', () => {
	const reader = new JsonReader();
	const keys = reader.parse(`{
  "srcLang": "en-GB",
  "units": [
    {
      "term": "This is a test",
      "context": {
        "domain": "messages"
      }
    }
  ]
}`);

	expect(keys).toHaveLength(1);
	expect(keys[0]?.term).toBe('This is a test');
	expect(keys[0]?.originalId).toBe('This is a test');
	expect(keys[0]?.keyId).toBe('ce114e4501d2f4e2dcea3e17b546f339');
	expect(keys[0]?.meaning).toBe(null);
	expect(keys[0]?.description).toBe(null);
	expect(keys[0]?.srcLang).toBe('en-GB');
});
