

import { ChiriExpressionOperand, ChiriUnaryExpression } from "../../ChiriAST";
import ChiriReader from "../ChiriReader";
import { Operator } from "../ChiriTypeManager";
import consumeDecimalOptional from "./consumeDecimalOptional";
import consumeIntegerOptional from "./consumeIntegerOptional";
import consumeNewBlockLineOptional from "./consumeNewBlockLineOptional";
import consumeStringOptional from "./consumeStringOptional";
import consumeUnsignedIntegerOptional from "./consumeUnsignedIntegerOptional";
import consumeWhiteSpace from "./consumeWhiteSpace";
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional";
import consumeWordOptional from "./consumeWordOptional";

const empy = {} as never;

export default (reader: ChiriReader, expectedType?: string): ChiriExpressionOperand => {
	const e = reader.i;
	const operand = consumeExpression(reader);

	const typeName = getOperandTypeName(operand);
	if (expectedType && expectedType !== "*" && typeName !== expectedType)
		throw reader.error(e, `Expected '${expectedType}', got '${typeName}'`);

	return operand;
};

const getOperandTypeName = (operand: ChiriExpressionOperand) => operand.type === "literal" /*&& operand.subType !== "other"*/ ? operand.subType : operand.valueType;

const consumeOperand = (reader: ChiriReader): ChiriExpressionOperand => {
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

	const string = consumeStringOptional(reader);
	if (string)
		return string;

	let e = reader.i;
	if (reader.consumeOptional("_"))
		return { type: "literal", subType: "undefined", position: reader.getPosition(e) };

	e = reader.i;
	const word = consumeWordOptional(reader);
	if (word) {
		const variable = reader.getVariable(word.value);
		if (variable)
			return {
				type: "get",
				name: word,
				valueType: variable.valueType,
			};

		throw reader.error(e, `No variable '${word.value}'`);
	}

	throw reader.error("Unknown expression operand type");
};

const consumeOperatorOptional = (reader: ChiriReader, operators: Record<Operator, Record<string, string>>): string | undefined => {
	for (const o in operators)
		if (reader.consumeOptional(o))
			return o;
	return undefined;
};

const consumeExpression = (reader: ChiriReader): ChiriExpressionOperand => {
	const e = reader.i;
	let operandA = consumeUnaryExpression(reader);

	const binaryOperators = reader.getBinaryOperators();
	while (true) {
		const p = reader.i;
		if (!consumeWhiteSpaceOptional(reader) || consumeNewBlockLineOptional(reader))
			return operandA;

		const operandATypeName = getOperandTypeName(operandA);
		const operatorsForType = binaryOperators[operandATypeName] ?? empy;
		const operator = consumeOperatorOptional(reader, operatorsForType);
		if (!operator) {
			reader.i = p;
			return operandA;
		}

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

const consumeUnaryExpression = (reader: ChiriReader): ChiriUnaryExpression | ChiriExpressionOperand => {
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
