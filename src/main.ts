import { getInput } from "@actions/core";
import { AppendDiffApp } from "./app/append-diff.js";
import { CreateDiffApp } from "./app/create-diff.js";
import { ConfigParser } from "./lib/config-parser.js";

(async (): Promise<void> => {
	const configs = ConfigParser.parse();

	let app;
	switch (getInput("mode")) {
		case "createDiff":
			app = new CreateDiffApp(configs);
			break;
		case "appendDiff":
			app = new AppendDiffApp();
			break;
		default:
			throw new Error("Invalid mode configured in the action");

	}

	await app.run();
})();
