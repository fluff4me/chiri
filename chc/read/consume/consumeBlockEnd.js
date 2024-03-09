// @ts-check

const consumeIndent = require("./consumeIndent");

/** @param {import("../ChiriReader")} reader */
module.exports = reader => {
	reader.indent--;
	while (reader.consumeOptional("\r"));
	reader.consume("\n");

	const e = reader.i;
	const consumedIndent = consumeIndent(reader);
	if (consumedIndent < reader.indent)
		throw reader.error(e, "Not enough indentation");
	else if (consumedIndent > reader.indent)
		throw reader.error(e, "Too much indentation");

	return true;
};
