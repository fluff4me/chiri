const consumeFunctionBodyOptional = require("../consume/consumeFunctionBodyOptional");
const consumeOptionalString = require("../consume/consumeStringOptional");

/** @type {import("../ChiriTypeManager").ChiriTypeDefinition} */
module.exports = {
	/** @returns {ChiriLiteralString | undefined} */
	consumeOptionalConstructor: consumeFunctionBodyOptional,
};
