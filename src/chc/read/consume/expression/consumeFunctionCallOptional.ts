import { ChiriType } from "../../../type/ChiriType"
import typeFunction from "../../../type/typeFunction"
import getFunctionParameters from "../../../util/getFunctionParameters"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
import consumeBlockEnd from "../consumeBlockEnd"
import consumeBlockStartOptional from "../consumeBlockStartOptional"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
import consumeValueText from "../consumeValueText"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWordOptional from "../consumeWordOptional"
import type { ChiriFunction } from "../macro/macroFunctionDeclaration"
import type { ChiriExpressionOperand, ChiriExpressionResult } from "./consumeExpression"
import consumeExpression from "./consumeExpression"

export interface ChiriFunctionCall {
	type: "function-call"
	name: ChiriWord
	indexedAssignments: boolean
	assignments: Record<string, ChiriExpressionResult>
	valueType: ChiriType
	position: ChiriPosition
}

export default (reader: ChiriReader, ...expectedTypes: ChiriType[]): ChiriFunctionCall | undefined => {
	const position = reader.getPosition()
	const restore = reader.savePosition()

	const e = reader.i
	const name = consumeWordOptional(reader)
	const fn = name && resolveFunctionFromName(reader, name)
	if (!fn) {
		reader.restorePosition(restore)
		return undefined
	}

	const parameters = resolveFunctionParameters(reader, fn)

	const variableSharingName = reader.getVariableOptional(name.value)
	if (variableSharingName && variableSharingName.valueType.name.value !== "function" && parameters.length && !reader.consumeOptional("(")) {
		reader.restorePosition(restore)
		return undefined
	}

	if (!reader.peek("(")) {
		reader.restorePosition(restore)
		return undefined
	}

	return consumePartialFuntionCall(reader, position, name, fn, true, undefined, parameters, ...expectedTypes)
}

export function consumePartialFuntionCall (reader: ChiriReader, position: ChiriPosition, name: ChiriWord, fn: ChiriFunction | ChiriCompilerVariable, requireParens: boolean, boundFirstParam: ChiriExpressionOperand | undefined, parameters: ChiriCompilerVariable[] | ChiriType[], ...expectedTypes: ChiriType[]): ChiriFunctionCall {
	const assignments: Record<string, ChiriExpressionOperand> = {}
	let parens = true
	if (requireParens)
		reader.consume("(")
	else
		parens = !!reader.consumeOptional("(")

	if (parameters.length) {
		for (let i = 0; i < parameters.length; i++) {
			const parameter = parameters[i]
			if (i > 0) {
				if (!parens || !reader.consumeOptional(",") && (parameter.type === "type" || parameter.assignment !== "??=")) {
					const missingParameters = parameters.slice(i)
						.map(param => param.type === "type" ? ChiriType.stringify(param)
							: `${param.expression ? "[" : ""}${ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
						.join(", ")
					throw reader.error(`Missing parameters for #function ${fn.name.value}: ${missingParameters}`)
				}

				consumeWhiteSpaceOptional(reader)
			}

			if (!parens || reader.peek(")")) {
				const missingParameters = parameters.slice(i)
					.filter(param => param.type === "type" || !param.assignment)
					.map(param => param.type === "type" ? ChiriType.stringify(param)
						: `${param.expression ? "[" : ""}${ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
					.join(", ")

				if (missingParameters)
					throw reader.error(`Missing required parameters for #function ${fn.name.value}: ${missingParameters}`)

				break
			}

			const paramType = parameter.type === "type" ? parameter : parameter.valueType
			const expectedType = [paramType]
			if (parameter.type === "variable" && parameter.assignment === "??=")
				expectedType.push(ChiriType.of("undefined"))

			const key = parameter.type === "type" ? i : parameter.name.value
			if (paramType.name.value !== "raw")
				assignments[key] = consumeExpression.inline(reader, ...expectedType)
			else {
				const multiline = consumeBlockStartOptional(reader)
				assignments[key] = consumeValueText(reader, multiline, () => !!reader.peek(")"))
				if (multiline) consumeBlockEnd(reader)
			}
		}
	}

	reader.consumeOptional(")")

	const returnType = computeFunctionReturnType(reader, fn, assignments, boundFirstParam)
	if (!reader.types.isAssignable(returnType, ...expectedTypes))
		throw reader.error(`Expected ${expectedTypes.map(type => `"${ChiriType.stringify(type)}"`).join(", ")}, but #function ${fn.name.value} will return "${ChiriType.stringify(returnType)}"`)

	return {
		type: "function-call",
		name,
		indexedAssignments: fn.type !== "function",
		assignments,
		valueType: returnType,
		position,
	}
}

function resolveFunctionFromName (reader: ChiriReader, name: ChiriWord): ChiriFunction | ChiriCompilerVariable | undefined {
	const variable = reader.getVariableOptional(name.value)
	if (variable && variable.valueType.name.value === "function")
		return variable
	else if (variable)
		return undefined

	return reader.getFunctionOptional(name.value)
}

function resolveFunctionParameters (reader: ChiriReader, fn: ChiriFunction | ChiriCompilerVariable) {
	if (fn.type === "function")
		return getFunctionParameters(fn)

	return fn.valueType.generics.slice(0, -1) // params are every type up to the last (which is the return type)
}

function resolveFunctionReturnType (reader: ChiriReader, fn: ChiriFunction | ChiriCompilerVariable) {
	if (fn.type === "function")
		return fn.returnType

	return fn.valueType.generics.at(-1)! // last = return type
}

function computeFunctionReturnType (reader: ChiriReader, fn: ChiriFunction | ChiriCompilerVariable, assignments: Record<string, ChiriExpressionOperand>, boundFirstParam?: ChiriExpressionOperand): ChiriType {
	const returnType = resolveFunctionReturnType(reader, fn)
	if (returnType.isGeneric) {
		const matches = getMatchingGenericTypeParameters(reader, returnType, fn, assignments, boundFirstParam)
		if (!matches.length)
			return returnType

		return reader.types.intersection(...matches)
	}

	if (!returnType.generics.some(type => type.isGeneric))
		return returnType

	const mappedGenerics = returnType.generics
		.map(type => {
			if (!type.isGeneric)
				return type

			const matches = getMatchingGenericTypeParameters(reader, type, fn, assignments, boundFirstParam)
			// console.log(Strings.debug({
			// 	fnType: fn.type,
			// 	type,
			// 	assignments,
			// 	boundFirstParam,
			// 	matches,
			// }))
			if (!matches.length)
				return type

			return reader.types.intersection(...matches)
		})
	return ChiriType.of(returnType.name.value, ...mappedGenerics)
}

function getMatchingGenericTypeParameters (reader: ChiriReader, matching: ChiriType, fn: ChiriFunction | ChiriCompilerVariable, assignments: Record<string, ChiriExpressionOperand>, boundFirstParam?: ChiriExpressionOperand): ChiriType[] {
	if (fn.type === "function") {
		const matches: ChiriType[] = []
		let firstParam = true
		for (const statement of fn.content) {
			if (statement.type !== "variable")
				continue

			let assignment: ChiriExpressionOperand | undefined
			if (firstParam) {
				firstParam = false
				assignment = boundFirstParam
				// console.log("first param", Strings.debug({
				// 	boundFirstParam,
				// 	varType: statement.valueType,
				// }))
			}

			assignment ??= assignments[statement.name.value]
			if (!assignment)
				continue

			if (!!statement.valueType.isGeneric && statement.valueType.name.value === matching.name.value) {
				if (assignment)
					matches.push(assignment.valueType)
				continue
			}

			if (statement.valueType.name.value === typeFunction.type.name.value)
				pushMatchingFunctionGenericTypeParameters(reader, matches, matching, statement.valueType.generics, assignment.valueType.generics)
			else
				pushMatchingNonFunctionGenericTypeParameters(reader, matches, matching, statement.valueType.generics, assignment.valueType.generics)
		}

		return matches
	}

	const matches: ChiriType[] = []
	const parameters = resolveFunctionParameters(reader, fn) as ChiriType[]
	for (let i = 0; i < parameters.length; i++) {
		let assignment: ChiriExpressionOperand | undefined
		if (i === 0)
			assignment = boundFirstParam ?? assignments[0]

		assignment ??= assignments[i]
		if (!assignment)
			continue

		const parameter = parameters[i]
		if (!!parameter.isGeneric && parameter.name.value === matching.name.value) {
			matches.push(assignment.valueType)
			continue
		}

		if (parameter.name.value === typeFunction.type.name.value)
			pushMatchingFunctionGenericTypeParameters(reader, matches, matching, parameter.generics, assignment.valueType.generics)
		else
			pushMatchingNonFunctionGenericTypeParameters(reader, matches, matching, parameter.generics, assignment.valueType.generics)
	}

	return matches
}

function pushMatchingNonFunctionGenericTypeParameters (reader: ChiriReader, pushTo: ChiriType[], matching: ChiriType, generics: ChiriType[], assignments: ChiriType[]) {
	if (!generics.length)
		return

	for (let j = 0; j < generics.length; j++) {
		const generic = generics[j]
		if (!!generic.isGeneric && generic.name.value === matching.name.value) {
			pushTo.push(assignments[j])
			continue
		}
	}
}

function pushMatchingFunctionGenericTypeParameters (reader: ChiriReader, pushTo: ChiriType[], matching: ChiriType, generics: ChiriType[], assignments: ChiriType[]) {
	if (!generics.length)
		return

	const returnType = generics[generics.length - 1]
	if (!!returnType.isGeneric && returnType.name.value === matching.name.value)
		pushTo.push(assignments[assignments.length - 1])

	const length = Math.max(generics.length - 1, assignments.length - 1)
	for (let j = 0; j < length; j++) {
		const generic = generics[j]
		if (!!generic.isGeneric && generic.name.value === matching.name.value) {
			pushTo.push(assignments[j])
			continue
		}
	}
}
