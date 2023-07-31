// @ts-check

const consumeIntegerOptional = require("../consume/consumeIntegerOptional");
const consumeUnsignedIntegerOptional = require("../consume/consumeUnsignedIntegerOptional");

/** @type {import("../ThetaTypeManager").ThetaTypeDefinition} */
module.exports = {
	stringable: true,
	consumeOptionalConstructor: reader => consumeIntegerOptional(reader),
};
