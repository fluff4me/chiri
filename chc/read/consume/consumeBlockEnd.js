// @ts-check

const consumeIndent = require("./consumeIndent");
const consumeNewBlockLineOptional = require("./consumeNewBlockLineOptional");
const consumeNewLineOptional = require("./consumeNewLineOptional");

/** @param {import("../ChiriReader")} reader */
module.exports = reader => {
	const savedPosition = reader.savePosition();
	reader.indent--;
	let consumed = false;
	while (consumeNewLineOptional(reader)) consumed = true;

	if (!consumed)
		throw reader.error("Expected end of block");

	const e = reader.i;
	const consumedIndent = consumeIndent(reader);
	if (consumedIndent > reader.indent)
		throw reader.error(e, "Too much indentation");

	reader.restorePosition(savedPosition);
	return true;
};
