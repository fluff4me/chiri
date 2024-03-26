// @ts-check

const consumeIntegerOptional = require("../consume/consumeIntegerOptional");

/** @type {import("../ChiriTypeManager").ChiriTypeDefinition} */
module.exports = {
	stringable: true,
	consumeOptionalConstructor: reader => consumeIntegerOptional(reader),
};
