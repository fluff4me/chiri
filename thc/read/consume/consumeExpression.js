// @ts-check

const consumeDecimalOptional = require("./consumeDecimalOptional");
const consumeNewBlockLineOptional = require("./consumeNewBlockLineOptional");
const consumeUnsignedIntegerOptional = require("./consumeUnsignedIntegerOptional");
const consumeIntegerOptional = require("./consumeUnsignedIntegerOptional");
const consumeWhiteSpace = require("./consumeWhiteSpace");
const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");
const consumeWordOptional = require("./consumeWordOptional");

const empy = {};

/** 
 * @param {import("../ThetaReader")} reader 
 * @param {ThetaType=} expectedType
 * @returns {ThetaExpressionOperand}
 */
module.exports = (reader, expectedType) => {
	const e = reader.i;
	const operand = consumeExpression(reader);

	const typeName = getOperandTypeName(operand);
	if (expectedType && expectedType.name.value !== "*" && typeName !== expectedType.name.value)
		throw reader.error(e, `Expected '${expectedType.name.value}', got '${typeName}'`);

	return operand;
};

/** @param {ThetaExpressionOperand} operand */
const getOperandTypeName = operand => operand.type === "literal" && operand.subType !== "other" ? operand.subType : operand.valueType;

/** 
 * @param {import("../ThetaReader")} reader 
 * @returns {ThetaExpressionOperand}
 */
const consumeOperand = reader => {
	if (reader.consumeOptional("(")) {
		const expr = consumeExpression(reader);
		reader.consume(")");
		if (expr.type === "expression" && expr.subType === "binary")
			expr.wrapped = true;
		return expr;
	}

	// TODO automatically try to optionally consume whatever types can go in this context
	const numeric = consumeUnsignedIntegerOptional(reader) ?? consumeIntegerOptional(reader) ?? consumeDecimalOptional(reader);
	if (numeric)
		return numeric;

	let e = reader.i;
	if (reader.consumeOptional("."))
		return { type: "literal", subType: "undefined", position: reader.getPosition(e) };

	e = reader.i;
	const word = consumeWordOptional(reader);
	if (word) {
		const declaration = reader.getDeclarationOptional(word.value);
		if (declaration)
			return {
				type: "get",
				name: word,
				valueType: declaration.valueType,
			};

		throw reader.error(e, `No declaration '${word.value}'`);
	}

	throw reader.error("Unknown expression operand type");
};

/**
 * @param {import("../ThetaReader")} reader
 * @param {Record<import("../ThetaTypeManager").Operator, Record<string, string>>} operators 
 * @returns {string=}
 */
const consumeOperatorOptional = (reader, operators) => {
	for (const o in operators)
		if (reader.consumeOptional(o))
			return o;
	return undefined;
};

/**
 * @param {import("../ThetaReader")} reader
 * @returns {ThetaExpressionOperand}
 */
const consumeExpression = reader => {
	const e = reader.i;
	let operandA = consumeUnaryExpression(reader);

	const binaryOperators = reader.getBinaryOperators();
	while (true) {
		if (!consumeWhiteSpaceOptional(reader) || consumeNewBlockLineOptional(reader))
			return operandA;

		const operandATypeName = getOperandTypeName(operandA);
		const operatorsForType = binaryOperators[operandATypeName] ?? empy;
		const operator = consumeOperatorOptional(reader, operatorsForType);
		if (!operator)
			return operandA;

		consumeWhiteSpace(reader);

		const resultTypesByOperandB = operatorsForType[operator] ?? empy;

		const operandB = consumeUnaryExpression(reader);
		const operandBTypeName = getOperandTypeName(operandB);
		const resultType = resultTypesByOperandB[operandBTypeName];
		if (!resultType)
			throw reader.error(`Undefined operation ${operandATypeName}${operator}${operandBTypeName}`);

		operandA = {
			type: "expression",
			subType: "binary",
			operandA,
			operandB,
			operator,
			valueType: resultType,
		};
	}
}

/** 
 * @param {import("../ThetaReader")} reader 
 * @returns {ThetaUnaryExpression | ThetaExpressionOperand} 
 */
const consumeUnaryExpression = reader => {
	const e = reader.i;
	const unaryOperators = reader.getUnaryOperators();
	const operator = consumeOperatorOptional(reader, unaryOperators);

	const operand = consumeOperand(reader);
	if (!operator)
		return operand;

	const resultsByType = unaryOperators[operator] ?? empy;

	const typeName = getOperandTypeName(operand);
	const returnType = resultsByType[typeName];
	if (!returnType)
		throw reader.error(e, `Undefined operation ${operator}${typeName}`);

	return {
		type: "expression",
		subType: "unary",
		operand,
		operator,
		valueType: returnType,
	};
}
