// @ts-check

const consumeNewBlockLineOptional = require("./consumeNewBlockLineOptional");

/** 
 * @param {import("../ThetaReader")} reader 
 * @returns {ThetaDocumentation | undefined}
 */
module.exports = reader => {
	if (!reader.consumeOptional(";; "))
		return undefined;

	let documentation = "";
	while (true) {
		if (documentation && !reader.consumeOptional("  "))
			documentation += "\n";

		for (; reader.i < reader.input.length; reader.i++) {
			if (reader.input[reader.i] === "\n") {
				documentation += "\n";
				break;
			} else if (reader.input[reader.i] !== "\r")
				documentation += reader.input[reader.i];
		}

		if (!consumeNewBlockLineOptional(reader))
			throw reader.error("Expected additional documentation or documented declaration");

		if (!reader.consumeOptional(";; "))
			return {
				type: "documentation",
				content: documentation.slice(0, -1),
			};
	}
};
