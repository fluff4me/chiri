// @ts-check

const consumeIntegerOptional = require("../consume/consumeUnsignedIntegerOptional");

/** @type {import("../ThetaTypeManager").ThetaTypeDefinition} */
module.exports = {
	stringable: true,
	consumeOptionalConstructor: reader => consumeIntegerOptional(reader),
};
