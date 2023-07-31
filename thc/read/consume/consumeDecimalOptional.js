// @ts-check

const consumeUnsignedIntegerOptional = require("./consumeUnsignedIntegerOptional");

/** 
 * @param {import("../ThetaReader")} reader 
 * @returns {ThetaLiteralNumeric | undefined}
 */
module.exports = reader => {
	const e = reader.i;
	const negative = reader.consumeOptional("-") ?? "";

	const int = consumeUnsignedIntegerOptional(reader);
	if (int === undefined) {
		reader.i = e;
		return undefined;
	}

	if (!reader.consumeOptional(".")) {
		reader.i = e;
		return undefined;
	}

	const dec = consumeUnsignedIntegerOptional(reader);
	if (!dec) {
		reader.i = e;
		return undefined;
	}

	return {
		type: "literal",
		subType: "dec",
		value: `${negative}${int.value}.${dec.value}`
	};
};
