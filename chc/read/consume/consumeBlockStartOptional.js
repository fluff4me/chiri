// @ts-check

const consumeIndent = require("./consumeIndent");
const consumeNewLineOptional = require("./consumeNewLineOptional");

/** @param {import("../ChiriReader")} reader */
module.exports = reader => {
	if (!consumeNewLineOptional(reader))
		return false;

	reader.indent++;

	const e = reader.i;
	const consumedIndent = consumeIndent(reader);
	if (consumedIndent < reader.indent)
		throw reader.error(e, `Not enough indentation. Expected ${reader.indent}, found ${consumedIndent}`);
	else if (consumedIndent > reader.indent)
		throw reader.error(e, `Too much indentation. Expected ${reader.indent}, found ${consumedIndent}`);
	return true;
};
