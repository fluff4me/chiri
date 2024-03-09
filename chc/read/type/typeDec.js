// @ts-check

const consumeDecimalOptional = require("../consume/consumeDecimalOptional");

/** @type {import("../ChiriTypeManager").ChiriTypeDefinition} */
module.exports = {
	stringable: true,
	consumeOptionalConstructor: reader => consumeDecimalOptional(reader),
};
