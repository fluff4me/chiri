

import { ChiriType } from "../../../type/ChiriType"
import type { Operator } from "../../../type/ChiriTypeManager"
import type ChiriReader from "../../ChiriReader"
import consumeStringOptional from "../consumeStringOptional"
import type { ChiriLiteralValue } from "../consumeTypeConstructorOptional"
import consumeTypeConstructorOptional from "../consumeTypeConstructorOptional"
import type { ChiriValueText } from "../consumeValueText"
import consumeWhiteSpace from "../consumeWhiteSpace"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWordOptional from "../consumeWordOptional"
import consumeDecimalOptional from "../numeric/consumeDecimalOptional"
import consumeIntegerOptional from "../numeric/consumeIntegerOptional"
import consumeUnsignedIntegerOptional from "../numeric/consumeUnsignedIntegerOptional"
import type { ChiriFunctionCall } from "./consumeFunctionCallOptional"
import consumeFunctionCallOptional from "./consumeFunctionCallOptional"
import type { ChiriExpressionMatch } from "./expressionMatch"
import expressionMatch from "./expressionMatch"

export interface ChiriBinaryExpression {
	type: "expression"
	subType: "binary"
	operandA: ChiriExpressionOperand
	operandB: ChiriExpressionResult
	operator: string
	valueType: ChiriType
	wrapped?: true
}

export interface ChiriUnaryExpression {
	type: "expression"
	subType: "unary"
	operand: ChiriExpressionOperand
	operator: string
	valueType: ChiriType
}

export interface ChiriVariableReference {
	type: "get"
	name: ChiriWord
	valueType: ChiriType
}

export type ChiriExpressionOperand =
	| ChiriBinaryExpression
	| ChiriUnaryExpression
	| ChiriLiteralValue
	| ChiriVariableReference
	| ChiriValueText
	| ChiriFunctionCall

export type ChiriExpressionResult =
	| ChiriExpressionOperand
	| ChiriExpressionMatch

type VerifyExpressionResult = ChiriExpressionResult["valueType"]

export type ExpressionOperandConsumer = (reader: ChiriReader, ...expectedTypes: ChiriType[]) => ChiriExpressionOperand

const empy = {} as never

async function consumeExpression (reader: ChiriReader, ...expectedTypes: ChiriType[]): Promise<ChiriExpressionResult> {
	return undefined
		?? await expressionMatch.consumeOptional(reader, consumeExpression, ...expectedTypes)
		?? consumeExpressionValidated(reader, ...expectedTypes)
}

namespace consumeExpression {
	export function inline (reader: ChiriReader, ...expectedTypes: ChiriType[]): ChiriExpressionOperand {
		return consumeExpressionValidated(reader, ...expectedTypes)
	}
}

export default consumeExpression

const consumeExpressionValidated = (reader: ChiriReader, ...expectedTypes: ChiriType[]) => {
	const e = reader.i
	const operand = consumeExpressionInternal(reader)

	const valueType = operand.valueType
	if (expectedTypes.length && !expectedTypes.some(expectedType => reader.types.isAssignable(valueType, expectedType)))
		throw reader.error(e, `Expected ${expectedTypes.map(type => `"${ChiriType.stringify(type)}"`).join(" or ")}, got "${ChiriType.stringify(valueType)}"`)

	return operand
}

const consumeOperand = (reader: ChiriReader): ChiriExpressionOperand => {
	if (reader.consumeOptional("(")) {
		const expr = consumeExpressionInternal(reader)
		reader.consume(")")
		if (expr.type === "expression" && expr.subType === "binary")
			expr.wrapped = true
		return expr
	}

	const numeric = consumeDecimalOptional(reader) ?? consumeUnsignedIntegerOptional(reader) ?? consumeIntegerOptional(reader)
	if (numeric)
		return numeric

	const string = consumeStringOptional(reader)
	if (string)
		return string

	let e = reader.i
	if (reader.consumeOptional("_"))
		return { type: "literal", subType: "undefined", valueType: ChiriType.of("undefined"), position: reader.getPosition(e) }

	const constructedType = consumeTypeConstructorOptional(reader)
	if (constructedType) return constructedType

	const fnCall = consumeFunctionCallOptional(reader)
	if (fnCall)
		return fnCall

	e = reader.i
	const word = consumeWordOptional(reader)
	if (word) {
		const variable = reader.getVariableOptional(word.value)
		if (variable?.valueType.name.value === "body")
			throw reader.error(e, "Cannot use a variable of type \"body\" in an expression")

		if (variable)
			return {
				type: "get",
				name: word,
				valueType: variable.valueType,
			}

		throw reader.error(e, `No variable "${word.value}"`)
	}

	throw reader.error("Unknown expression operand type")
}

export const consumeOperatorOptional = (reader: ChiriReader, operators: Partial<Record<Operator, Record<string, string | undefined>>>, precedence?: number): Operator | undefined => {
	for (const o in operators) {
		if (precedence !== undefined && !reader.types.precedence[precedence].includes(o as Operator))
			// not correct precedence, skip for now
			continue

		if (reader.consumeOptional(o))
			return o as Operator
	}

	return undefined
}

const consumeExpressionInternal = (reader: ChiriReader, precedence = 0): ChiriExpressionOperand => {
	if (precedence >= reader.types.precedence.length)
		return consumeUnaryExpression(reader)

	const e = reader.i
	let operandA = consumeExpressionInternal(reader, precedence + 1)

	const binaryOperators = reader.types.binaryOperators
	while (true) {
		const p = reader.i
		if (!consumeWhiteSpaceOptional(reader) /* || consumeNewBlockLineOptional(reader) */)
			return operandA

		const operandATypeName = operandA.valueType.name.value
		const operatorsForType = binaryOperators[operandATypeName] ?? empy
		const operator = consumeOperatorOptional(reader, operatorsForType, precedence)
		if (!operator) {
			reader.i = p
			return operandA
		}

		consumeWhiteSpace(reader)

		const resultTypesByOperandB = operatorsForType[operator] ?? empy

		const operandB = consumeExpressionInternal(reader, precedence + 1)

		const operandBTypeName = operandB.valueType.name.value
		const resultType = resultTypesByOperandB[operandBTypeName]
		if (!resultType)
			throw reader.error(e, `Undefined operation ${operandATypeName}${operator}${operandBTypeName}`)

		// const coercion = reader.types.binaryOperatorCoercion[operandATypeName]?.[operator]?.[operandBTypeName]
		// const coerce = typeof coercion === "string" ? [coercion, coercion] as const : coercion
		// operandATypeName = coerce?.[0] ?? operandATypeName
		// operandBTypeName = coerce?.[0] ?? operandBTypeName

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
	const unaryOperators = reader.types.unaryOperators
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
