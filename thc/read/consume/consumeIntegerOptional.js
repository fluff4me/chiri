// @ts-check

const consumeUnsignedIntegerOptional = require("./consumeUnsignedIntegerOptional");

/** 
 * @param {import("../ThetaReader")} reader 
 * @returns {ThetaLiteralNumeric | undefined}
 */
module.exports = reader => {
	const e = reader.i;
	const position = reader.getPosition(e);
	const negative = reader.consumeOptional("-") ?? "";
	const numeric = consumeUnsignedIntegerOptional(reader);
	if (!numeric)
		reader.i = e;

	return !numeric ? undefined : {
		type: "literal",
		subType: "int",
		value: negative + numeric.value,
		position,
	}
};
