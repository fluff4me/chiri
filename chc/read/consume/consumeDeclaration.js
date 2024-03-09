// @ts-check

const assertNotWhiteSpaceAndNewLine = require("../assert/assertNotWhiteSpaceAndNewLine");
const consumeBlockEnd = require("./consumeBlockEnd");
const consumeBlockStartOptional = require("./consumeBlockStartOptional");
const consumeExpression = require("./consumeExpression");
const consumeOptionalIndent = require("./consumeIndentOptional");
const { consumeType } = require("./consumeType");
const consumeTypeConstructor = require("./consumeTypeConstructor");
const consumeTypeNameOptional = require("./consumeTypeNameOptional");
const consumeWhiteSpace = require("./consumeWhiteSpace");
const consumeWord = require("./consumeWord");

/** 
 * @param {import("../ChiriReader")} reader 
 * @returns {ChiriConstantDeclaration}
 */
module.exports = reader => {
	let e = reader.i;
	const position = reader.getPosition(e);
	if (consumeOptionalIndent(reader))
		throw reader.error(e, "Unexpected indentation, expected type");

	const type = consumeType(reader);

	consumeWhiteSpace(reader);

	e = reader.i;
	const name = consumeWord(reader);
	const existingDeclaration = reader.getDeclarationOptional(name.value);
	if (existingDeclaration)
		throw reader.error(e, `Declaration '${name}' already exists ('${existingDeclaration.valueType}' type)`);

	consumeWhiteSpace(reader);

	reader.consume("=");

	assertNotWhiteSpaceAndNewLine(reader);

	if (type.name.value === "*") {
		consumeWhiteSpace(reader);

		const typeName = consumeTypeNameOptional(reader);
		if (!typeName)
			throw reader.error("Inferred declarations require explicit type names for construction");

		type.name = typeName;

		const definition = reader.getType(typeName.value);
		if (definition.hasGenerics)
			throw reader.error(`Type '${typeName.value}' was automatically inferred, but it expects generics`);
	}

	assertNotWhiteSpaceAndNewLine(reader);
	const block = consumeBlockStartOptional(reader);

	if (!block)
		consumeWhiteSpace(reader);

	/** @type {ChiriExpressionOperand | undefined} */
	let value;
	if (reader.consumeOptional("()")) {
		consumeWhiteSpace(reader);
		value = consumeExpression(reader, type);
	} else {
		value = consumeTypeConstructor(reader, type);
	}

	if (block)
		consumeBlockEnd(reader);

	return {
		type: "declaration",
		subType: "constant",
		valueType: type.name.value,
		name,
		expression: value,
		position,
	}
};
