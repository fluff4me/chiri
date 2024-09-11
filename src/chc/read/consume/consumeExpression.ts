

import type { ChiriExpressionOperand, ChiriUnaryExpression } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import { ChiriType } from "../ChiriType"
import type { Operator } from "../ChiriTypeManager"
import consumeDecimalOptional from "./consumeDecimalOptional"
import consumeIntegerOptional from "./consumeIntegerOptional"
import consumeNewBlockLineOptional from "./consumeNewBlockLineOptional"
import consumeStringOptional from "./consumeStringOptional"
import consumeTypeConstructorOptional from "./consumeTypeConstructorOptional"
import consumeUnsignedIntegerOptional from "./consumeUnsignedIntegerOptional"
import consumeWhiteSpace from "./consumeWhiteSpace"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"
import consumeWordOptional from "./consumeWordOptional"

const empy = {} as never

export default (reader: ChiriReader, expectedType?: ChiriType): ChiriExpressionOperand => {
	const e = reader.i
	const operand = consumeExpression(reader)

	const valueType = operand.valueType
	if (expectedType && !reader.types.isAssignable(valueType, expectedType))
		throw reader.error(e, `Expected '${ChiriType.stringify(expectedType)}', got '${ChiriType.stringify(valueType)}'`)

	return operand
}

const consumeOperand = (reader: ChiriReader): ChiriExpressionOperand => {
	if (reader.consumeOptional("(")) {
		const expr = consumeExpression(reader)
		reader.consume(")")
		if (expr.type === "expression" && expr.subType === "binary")
			expr.wrapped = true
		return expr
	}

	const numeric = consumeUnsignedIntegerOptional(reader) ?? consumeIntegerOptional(reader) ?? consumeDecimalOptional(reader)
	if (numeric)
		return numeric

	const string = consumeStringOptional(reader)
	if (string)
		return string

	let e = reader.i
	if (reader.consumeOptional("_"))
		return { type: "literal", subType: "undefined", valueType: ChiriType.of("undefined"), position: reader.getPosition(e) }

	e = reader.i
	const word = consumeWordOptional(reader)
	if (word) {
		const variable = reader.getVariable(word.value)
		if (variable)
			return {
				type: "get",
				name: word,
				valueType: variable.valueType,
			}

		throw reader.error(e, `No variable '${word.value}'`)
	}

	const constructedType = consumeTypeConstructorOptional(reader)
	if (constructedType) return constructedType

	throw reader.error("Unknown expression operand type")
}

const consumeOperatorOptional = (reader: ChiriReader, operators: Record<Operator, Record<string, string>>): string | undefined => {
	for (const o in operators)
		if (reader.consumeOptional(o))
			return o
	return undefined
}

const consumeExpression = (reader: ChiriReader): ChiriExpressionOperand => {
	const e = reader.i
	let operandA = consumeUnaryExpression(reader)

	const binaryOperators = reader.getBinaryOperators()
	while (true) {
		const p = reader.i
		if (!consumeWhiteSpaceOptional(reader) || consumeNewBlockLineOptional(reader))
			return operandA

		const operandATypeName = operandA.valueType.name.value
		const operatorsForType = binaryOperators[operandATypeName] ?? empy
		const operator = consumeOperatorOptional(reader, operatorsForType)
		if (!operator) {
			reader.i = p
			return operandA
		}

		consumeWhiteSpace(reader)

		const resultTypesByOperandB = operatorsForType[operator] ?? empy

		const operandB = consumeUnaryExpression(reader)
		const operandBTypeName = operandB.valueType.name.value
		const resultType = resultTypesByOperandB[operandBTypeName]
		if (!resultType)
			throw reader.error(`Undefined operation ${operandATypeName}${operator}${operandBTypeName}`)

		operandA = {
			type: "expression",
			subType: "binary",
			operandA,
			operandB,
			operator,
			valueType: ChiriType.of(resultType),
		}
	}
}

const consumeUnaryExpression = (reader: ChiriReader): ChiriUnaryExpression | ChiriExpressionOperand => {
	const e = reader.i
	const unaryOperators = reader.getUnaryOperators()
	const operator = consumeOperatorOptional(reader, unaryOperators)

	const operand = consumeOperand(reader)
	if (!operator)
		return operand

	const resultsByType = unaryOperators[operator] ?? empy

	const typeName = operand.valueType.name.value
	const returnType = resultsByType[typeName]
	if (!returnType)
		throw reader.error(e, `Undefined operation ${operator}${typeName}`)

	return {
		type: "expression",
		subType: "unary",
		operand,
		operator,
		valueType: ChiriType.of(returnType),
	}
}
