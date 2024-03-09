// @ts-check

const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");

/** @param {import("../ChiriReader")} reader */
module.exports = reader => {
	const e = reader.i;
	consumeWhiteSpaceOptional(reader, false);
	if (!reader.consumeOptional("; ")) {
		reader.i = e;
		return;
	}

	for (; reader.i < reader.input.length; reader.i++)
		if (reader.input[reader.i] === "\n")
			break;
};
