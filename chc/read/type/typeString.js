// @ts-check

const consumeOptionalString = require("../consume/consumeStringOptional");

/** @type {import("../ChiriTypeManager").ChiriTypeDefinition} */
module.exports = {
	stringable: true,
	/** @returns {ChiriLiteralString | undefined} */
	consumeOptionalConstructor: consumeOptionalString,
};
