

import { ChiriType } from "../../../type/ChiriType"
import type { Operator } from "../../../type/ChiriTypeManager"
import type { ChiriFunctionReference } from "../../../type/typeFunction"
import typeInt from "../../../type/typeInt"
import typeList from "../../../type/typeList"
import typeRecord from "../../../type/typeRecord"
import typeString from "../../../type/typeString"
import _ from "../../../util/_"
import getFunctionParameters from "../../../util/getFunctionParameters"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
import consumeBlockEnd from "../consumeBlockEnd"
import consumeBlockStartOptional from "../consumeBlockStartOptional"
import consumeNewBlockLineOptional from "../consumeNewBlockLineOptional"
import consumeStringOptional from "../consumeStringOptional"
import type { ChiriLiteralValue } from "../consumeTypeConstructorOptional"
import consumeTypeConstructorOptional from "../consumeTypeConstructorOptional"
import type { ChiriBaseText } from "../consumeValueText"
import consumeWhiteSpace from "../consumeWhiteSpace"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import consumeWordOptional from "../consumeWordOptional"
import consumeDecimalOptional from "../numeric/consumeDecimalOptional"
import consumeIntegerOptional from "../numeric/consumeIntegerOptional"
import consumeUnsignedIntegerOptional from "../numeric/consumeUnsignedIntegerOptional"
import type { ChiriFunctionCall } from "./consumeFunctionCallOptional"
import consumeFunctionCallOptional, { consumePartialFuntionCall } from "./consumeFunctionCallOptional"
import type { ChiriLiteralRange } from "./consumeRangeOptional"
import consumeRangeOptional from "./consumeRangeOptional"
import type { ChiriExpressionMatch } from "./expressionMatch"
import expressionMatch from "./expressionMatch"

export interface ChiriBinaryExpression {
	type: "expression"
	subType: "binary"
	operandA: ChiriExpressionOperand
	operandB: ChiriExpressionResult
	operator: string
	valueType: ChiriType
	position: ChiriPosition
}

export interface ChiriUnaryExpression {
	type: "expression"
	subType: "unary"
	operand: ChiriExpressionOperand
	operator: string
	valueType: ChiriType
	position: ChiriPosition
}

export interface ChiriVariableReference {
	type: "get"
	name: ChiriWord
	valueType: ChiriType
	position: ChiriPosition
}

export interface ChiriGetByKey {
	type: "get-by-key"
	value: ChiriExpressionOperand
	key: ChiriExpressionOperand
	valueType: ChiriType
	position: ChiriPosition
}

export interface ChiriListSlice {
	type: "list-slice"
	list: ChiriExpressionOperand
	range: ChiriLiteralRange
	valueType: ChiriType
	position: ChiriPosition
}

export interface ChiriPipe {
	type: "pipe"
	left: ChiriExpressionOperand
	right: ChiriExpressionResult
	valueType: ChiriType
	position: ChiriPosition
}

export interface ChiriPipeUseLeft {
	type: "pipe-use-left"
	valueType: ChiriType
	position: ChiriPosition
}

export interface ChiriConditional {
	type: "conditional"
	condition: ChiriExpressionOperand
	ifTrue: ChiriExpressionOperand
	ifFalse: ChiriExpressionOperand
	valueType: ChiriType
	position: ChiriPosition
}

export type ChiriExpressionOperand =
	| ChiriBinaryExpression
	| ChiriUnaryExpression
	| ChiriLiteralValue
	| ChiriVariableReference
	| ChiriFunctionReference
	| ChiriBaseText
	| ChiriFunctionCall
	| ChiriPipe
	| ChiriPipeUseLeft
	| ChiriConditional
	| ChiriGetByKey
	| ChiriListSlice

export type ChiriExpressionResult =
	| ChiriExpressionOperand
	| ChiriExpressionMatch

type VerifyExpressionResult = ChiriExpressionResult["valueType"] | ChiriExpressionResult["position"]

export type ExpressionOperandConsumer = (reader: ChiriReader, ...expectedTypes: ChiriType[]) => ChiriExpressionOperand

const empy = {} as never

async function consumeExpression (reader: ChiriReader, ...expectedTypes: ChiriType[]): Promise<ChiriExpressionResult> {
	return _
		?? await expressionMatch.consumeOptional(reader, consumeExpression, ...expectedTypes)
		?? await consumeExpressionValidatedPipe(reader, ...expectedTypes)
}

namespace consumeExpression {
	export function inline (reader: ChiriReader, ...expectedTypes: ChiriType[]): ChiriExpressionOperand {
		return consumeExpressionValidated(reader, ...expectedTypes)
	}
}

export default consumeExpression

function validate (reader: ChiriReader, e: number, operand: ChiriExpressionOperand, ...expectedTypes: ChiriType[]) {
	const valueType = operand.valueType
	if (expectedTypes.length && !expectedTypes.some(expectedType => reader.types.isAssignable(valueType, expectedType)))
		throw reader.error(Math.max(e, reader.getLineStart()), `Expected ${expectedTypes.map(type => `"${ChiriType.stringify(type)}"`).join(" or ")}, got "${ChiriType.stringify(valueType)}"`)
}

async function consumeExpressionValidatedPipe (reader: ChiriReader, ...expectedTypes: ChiriType[]) {
	const e = reader.i
	const operand = await consumeExpressionPipe(reader)
	validate(reader, e, operand, ...expectedTypes)
	return operand
}

function consumeExpressionValidated (reader: ChiriReader, ...expectedTypes: ChiriType[]) {
	const e = reader.i
	const operand = consumeExpressionInternal(reader, undefined)
	validate(reader, e, operand, ...expectedTypes)
	return operand
}

async function consumeExpressionPipe (reader: ChiriReader) {
	let operand = consumeExpressionInternal(reader, undefined)

	if (!consumeBlockStartOptional(reader))
		return operand

	reader.pipeValueStack.push({ type: operand.valueType, used: false })
	do {
		const pipeStackIndex = reader.pipeValueStack.length - 1
		reader.pipeValueStack[pipeStackIndex].type = operand.valueType
		reader.pipeValueStack[pipeStackIndex].used = false

		const position = reader.getPosition()
		reader.consume("->")
		consumeWhiteSpace(reader)

		const restore = reader.savePosition()
		const name = consumeWordOptional(reader)
		const fn = name && reader.getFunctionOptional(name.value)
		if (fn) {
			const parameters = getFunctionParameters(fn)
			if (!reader.peek("(") && reader.types.isAssignable(operand.valueType, parameters[0].valueType) && parameters.every((parameter, i) => i === 0 || parameter.assignment)) {
				// value \n -> function-name \n
				operand = {
					type: "function-call",
					name,
					indexedAssignments: false,
					assignments: {
						[parameters[0].name.value]: operand,
					},
					valueType: fn.returnType,
					position: name.position,
				}
				continue
			}
		}

		reader.restorePosition(restore)

		const e = reader.i
		const right = await consumeExpression(reader)
		if (!reader.pipeValueStack[pipeStackIndex].used)
			throw reader.error(e, "Piped value is not used in this expression")

		operand = {
			type: "pipe",
			left: operand,
			right,
			valueType: right.valueType,
			position,
		}

	} while (consumeNewBlockLineOptional(reader))

	consumeBlockEnd(reader)

	reader.pipeValueStack.pop()
	return operand
}

export function consumeOperatorOptional (reader: ChiriReader, operators: Partial<Record<Operator, Record<string, string | undefined>>>, precedence?: number): Operator | undefined {
	for (const o in operators) {
		if (precedence !== undefined && !reader.types.precedence[precedence].includes(o as Operator))
			// not correct precedence, skip for now
			continue

		if (reader.consumeOptional(o))
			return o as Operator
	}

	return undefined
}

function consumeConditionalOptional (reader: ChiriReader): ChiriConditional | undefined {
	const position = reader.getPosition()
	const e = reader.i
	if (!reader.consumeOptional("if "))
		return undefined

	const condition = consumeExpression.inline(reader)

	reader.consume(":")

	consumeWhiteSpaceOptional(reader)
	const ifTrue = consumeExpression.inline(reader)

	consumeWhiteSpace(reader)
	reader.consume("else:")

	consumeWhiteSpaceOptional(reader)
	const ifFalse = consumeExpression.inline(reader)

	if (ifTrue.valueType.name.value !== ifFalse.valueType.name.value || ifTrue.valueType.generics.some((generic, i) => generic.name.value !== ifFalse.valueType.generics[i].name.value))
		throw reader.error(e, `Conditional expression must return the same value type for both branches. Currently returning "${ChiriType.stringify(ifTrue.valueType)}" and "${ChiriType.stringify(ifFalse.valueType)}"`)

	return {
		type: "conditional",
		valueType: ifTrue.valueType,
		condition,
		ifTrue,
		ifFalse,
		position,
	}
}

function consumeExpressionInternal (reader: ChiriReader, precedence = 0): ChiriExpressionOperand {
	const ternary = consumeConditionalOptional(reader)
	if (ternary)
		return ternary

	if (precedence >= reader.types.precedence.length)
		return consumeUnaryExpression(reader)

	const position = reader.getPosition()
	const e = reader.i
	let operandA = consumeExpressionInternal(reader, precedence + 1)

	const binaryOperators = reader.types.binaryOperators
	while (true) {
		const p = reader.i
		if (!consumeWhiteSpaceOptional(reader) /* || consumeNewBlockLineOptional(reader) */)
			return operandA

		const operandATypeName = operandA.valueType.isGeneric && reader.types.isEveryType(operandA.valueType.generics) ? "*" : operandA.valueType.name.value
		const operatorsForType = binaryOperators[operandATypeName] ?? empy
		const operator = consumeOperatorOptional(reader, operatorsForType, precedence)
		if (!operator) {
			reader.i = p
			return operandA
		}

		consumeWhiteSpace(reader)

		const resultTypesByOperandB = operatorsForType[operator] ?? empy

		const operandB = consumeExpressionInternal(reader, precedence + 1)

		const operandBTypeName = operandB.valueType.isGeneric && reader.types.isEveryType(operandB.valueType.generics) ? "*" : operandB.valueType.name.value
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
			position,
		}
	}
}

function consumeOperand (reader: ChiriReader): ChiriExpressionOperand {
	if (reader.consumeOptional("(")) {
		const expr = consumeExpressionInternal(reader)
		reader.consume(")")
		return expr
	}

	let e = reader.i
	const pipeValueToken = consumeWordOptional(reader, "@")
	if (pipeValueToken) {
		const pipeValue = reader.pipeValueStack.at(-1)
		if (!pipeValue)
			throw reader.error(e, "@ can only be used in the right operand of a pipe expression")

		pipeValue.used = true
		return { type: "pipe-use-left", valueType: pipeValue.type, position: pipeValueToken.position }
	}

	const numeric = consumeDecimalOptional(reader) ?? consumeUnsignedIntegerOptional(reader) ?? consumeIntegerOptional(reader)
	if (numeric)
		return numeric

	const string = consumeStringOptional(reader)
	if (string)
		return string

	e = reader.i
	if (reader.consumeOptional("_"))
		return { type: "literal", subType: "undefined", valueType: ChiriType.of("undefined"), position: reader.getPosition(e) }

	const fnCall = consumeFunctionCallOptional(reader)
	if (fnCall)
		return fnCall

	const constructedType = consumeTypeConstructorOptional(reader)
	if (constructedType) return constructedType

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
				valueType: variable.valueType.name.value === "raw" ? ChiriType.of("string") : variable.valueType,
				position: word.position,
			}

		throw reader.error(e, `No variable "${word.value}"`)
	}

	throw reader.error("Unknown expression operand type")
}

function consumeUnaryExpression (reader: ChiriReader): ChiriUnaryExpression | ChiriExpressionOperand {
	const position = reader.getPosition()
	const e = reader.i
	const unaryOperators = reader.types.unaryOperators
	const operator = consumeOperatorOptional(reader, unaryOperators)
	if (operator)
		consumeWhiteSpaceOptional(reader)

	const operand = consumeInlineChain(reader)
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
		position,
	}
}

function consumeInlineChain (reader: ChiriReader): ChiriExpressionOperand {
	let operand = consumeOperand(reader)

	while (true) {
		const newOperand = consumeGetByKeyOrListSlice(reader, operand) ?? consumeInlinePipe(reader, operand)
		if (!newOperand)
			return operand

		operand = newOperand
	}
}

function consumeInlinePipe (reader: ChiriReader, operand: ChiriExpressionOperand): ChiriFunctionCall | undefined {
	if (!reader.consumeOptional("::"))
		return undefined

	const e = reader.i
	const name = consumeWord(reader)
	const fn = reader.getFunction(name.value, e)
	const parameters = getFunctionParameters(fn)
	const firstParameter = parameters.shift()!
	const paren = reader.peek("(")
	if (!paren && reader.types.isAssignable(operand.valueType, firstParameter.valueType) && parameters.every((parameter, i) => i === 0 || parameter.assignment)) {
		// value \n -> function-name \n
		return {
			type: "function-call",
			name,
			indexedAssignments: false,
			assignments: {
				[firstParameter.name.value]: operand,
			},
			valueType: fn.returnType,
			position: name.position,
		}
	}

	const fnCall = consumePartialFuntionCall(reader, name.position, name, fn, false, operand, parameters)
	fnCall.assignments[firstParameter.name.value] = operand
	return fnCall
}

function consumeGetByKeyOrListSlice (reader: ChiriReader, operand: ChiriExpressionOperand): ChiriGetByKey | ChiriListSlice | undefined {
	const isListOperand = reader.types.isAssignable(operand.valueType, typeList.type, typeString.type)
	if (!isListOperand && !reader.types.isAssignable(operand.valueType, typeRecord.type))
		return undefined

	if (!reader.consumeOptional("["))
		return undefined

	const position = reader.getPosition(reader.i - 1)
	const range = !isListOperand ? undefined : consumeRangeOptional(reader, true)
	if (range) {
		reader.consume("]")
		return {
			type: "list-slice",
			list: operand,
			range: range,
			valueType: operand.valueType,
			position,
		}
	}

	const expr = consumeExpression.inline(reader, isListOperand ? typeInt.type : typeString.type)
	reader.consume("]")
	return {
		type: "get-by-key",
		value: operand,
		key: expr,
		valueType: reader.types.isAssignable(operand.valueType, typeString.type) ? typeString.type : operand.valueType.generics[0],
		position,
	}
}
