// @ts-check

const consumeWordOptional = require("./consumeWordOptional");

/** @param {import("../ThetaReader")} reader */
module.exports = reader => {
	const e = reader.i;

	const type = consumeWordOptional(reader, "[]") // internal array type
		?? consumeWordOptional(reader, "{}") // internal object type
		?? consumeWordOptional(reader);

	if (!type)
		return undefined;

	if (!reader.getTypeOptional(type.value))
		throw reader.error(e, "There is no type '" + type.value + "'");

	return type;
};
