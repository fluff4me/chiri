// @ts-check

const consumeTypeNameOptional = require("./consumeTypeNameOptional");
const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");
const consumeWordOptional = require("./consumeWordOptional");

/** @param {import("../ThetaReader")} reader */
const consumeType = module.exports.consumeType = reader => {
	const e = reader.i;
	const type = consumeTypeOptional(reader);
	if (!type)
		throw reader.error(e, "Expected type");
	return type;
};

/**
 * @param {import("../ThetaReader")} reader
 * @returns {ThetaType | undefined}
 */
const consumeTypeOptional = module.exports.consumeTypeOptional = reader => {
	const e = reader.i;
	const typeName = consumeWordOptional(reader, "*") ?? consumeTypeNameOptional(reader);
	if (!typeName)
		return undefined;

	/** @type {ThetaType} */
	const type = {
		type: "type",
		name: typeName,
		generics: []
	};

	if (typeName.value === "*")
		return type;

	const definition = reader.getType(typeName.value);
	if (definition.hasGenerics) {
		consumeWhiteSpaceOptional(reader);
		type.generics = consumeGenerics(reader, definition.hasGenerics === true ? undefined : definition.hasGenerics);
	};

	return type;
};

/** 
 * @param {import("../ThetaReader")} reader
 * @param {number=} quantity
 */
const consumeGenerics = (reader, quantity) => {
	const generics = [];
	if (quantity)
		for (let g = 0; g < quantity; g++)
			generics.push(consumeType(reader));
	else
		while (true) {
			const type = consumeTypeOptional(reader);
			if (type)
				generics.push(type);
			else break;
		}
	return generics;
};
