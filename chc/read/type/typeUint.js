// @ts-check

const consumeIntegerOptional = require("../consume/consumeUnsignedIntegerOptional");

/** @type {import("../ChiriTypeManager").ChiriTypeDefinition} */
module.exports = {
	stringable: true,
	consumeOptionalConstructor: reader => consumeIntegerOptional(reader),
};
