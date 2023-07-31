// @ts-check

const consumeDecimalOptional = require("../consume/consumeDecimalOptional");

/** @type {import("../ThetaTypeManager").ThetaTypeDefinition} */
module.exports = {
	stringable: true,
	consumeOptionalConstructor: reader => consumeDecimalOptional(reader),
};
