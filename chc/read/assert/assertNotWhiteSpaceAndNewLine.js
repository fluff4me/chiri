// @ts-check

const consumeNewLineOptional = require("../consume/consumeNewLineOptional");
const consumeWhiteSpaceOptional = require("../consume/consumeWhiteSpaceOptional");

/** @param {import("../ChiriReader")} reader */
module.exports = reader => {
	const s = reader.i;
	const savedPosition = reader.savePosition();
	if (!consumeWhiteSpaceOptional(reader))
		return;

	const e = reader.i;
	if (consumeNewLineOptional(reader)) {
		reader.i = e;
		throw reader.error(s, "Extraneous whitespace before newline");
	}

	reader.restorePosition(savedPosition);
};
