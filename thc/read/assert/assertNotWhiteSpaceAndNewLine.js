// @ts-check

const consumeNewLineOptional = require("../consume/consumeNewLineOptional");
const consumeWhiteSpaceOptional = require("../consume/consumeWhiteSpaceOptional");

/** @param {import("../ThetaReader")} reader */
module.exports = reader => {
	const s = reader.i;
	if (!consumeWhiteSpaceOptional(reader))
		return;

	const e = reader.i;
	if (consumeNewLineOptional(reader)) {
		reader.i = e;
		throw reader.error(s, "Extraneous whitespace before newline");
	}

	reader.i = s;
};
