// @ts-check

const consumeIndent = require("./consumeIndent");
const consumeNewLineOptional = require("./consumeNewLineOptional");

/** @param {import("../ChiriReader")} reader */
module.exports = reader => {
	const e1 = reader.i;
	if (!consumeNewLineOptional(reader))
		return false;

	while (consumeNewLineOptional(reader));

	reader.indent++;

	const e2 = reader.i;
	const consumedIndent = consumeIndent(reader);
	if (consumedIndent < reader.indent) {
		reader.indent--;
		reader.i = e1;
		return false;
	} else if (consumedIndent > reader.indent)
		throw reader.error(e2, `Too much indentation. Expected ${reader.indent}, found ${consumedIndent}`);
	return true;
};
