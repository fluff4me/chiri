import { ChiriType } from "../../../type/ChiriType"
import getFunctionParameters from "../../../util/getFunctionParameters"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
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

	if (!parameters.length && !reader.peek("("))
		throw reader.error(e, `Ambiguous usage of name "${name.value}" — could be #${ChiriType.stringify(reader.getVariable(name.value).valueType)} ${name.value} or #function ${name.value} returns ${ChiriType.stringify(resolveFunctionReturnType(reader, fn))}`)

	return consumePartialFuntionCall(reader, position, name, fn, parameters, ...expectedTypes)
}

export function consumePartialFuntionCall (reader: ChiriReader, position: ChiriPosition, name: ChiriWord, fn: ChiriFunction | ChiriCompilerVariable, parameters: ChiriCompilerVariable[] | ChiriType[], ...expectedTypes: ChiriType[]): ChiriFunctionCall {
	const assignments: Record<string, ChiriExpressionOperand> = {}
	if (parameters.length) {
		reader.consume("(")
		for (let i = 0; i < parameters.length; i++) {
			const parameter = parameters[i]
			if (i > 0) {
				if (!reader.consumeOptional(",") && (parameter.type === "type" || parameter.assignment !== "??=")) {
					const missingParameters = parameters.slice(i)
						.map(param => param.type === "type" ? ChiriType.stringify(param)
							: `${param.expression ? "[" : ""}${ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
						.join(", ")
					throw reader.error(`Missing parameters for #function ${fn.name.value}: ${missingParameters}`)
				}

				consumeWhiteSpaceOptional(reader)
			}

			if (reader.peek(")")) {
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

			assignments[parameter.type === "type" ? i : parameter.name.value] =
				paramType.name.value !== "raw" ? consumeExpression.inline(reader, ...expectedType)
					: consumeValueText(reader, false, () => !!reader.peek(")"))
		}

		reader.consumeOptional(")")

	} else if (reader.consumeOptional("(")) {
		reader.consumeOptional(")")
	}

	const returnType = computeFunctionReturnType(reader, fn, assignments)
	if (!reader.types.isAssignable(returnType, ...expectedTypes))
		throw reader.error(`Expected ${expectedTypes.map(type => `"${ChiriType.stringify(type)}"`).join(", ")}, but #function ${fn.name.value} will return "${ChiriType.stringify(returnType)}"`)

	return {
		type: "function-call",
		name,
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

function computeFunctionReturnType (reader: ChiriReader, fn: ChiriFunction | ChiriCompilerVariable, assignments: Record<string, ChiriExpressionOperand>): ChiriType {
	const returnType = resolveFunctionReturnType(reader, fn)
	if (!returnType.isGeneric)
		return returnType

	if (fn.type === "function") {
		const parametersOfType = fn.content.filter((statement): statement is ChiriCompilerVariable => statement.type === "variable" && !!statement.valueType.isGeneric && statement.valueType.name.value === fn.returnType.name.value)
		return reader.types.intersection(...parametersOfType.map(parameter => assignments[parameter.name.value].valueType))
	}

	const parameters = resolveFunctionParameters(reader, fn) as ChiriType[]
	const parametersOfType = parameters
		.map((type, i) => [i, type] as const)
		.filter(([, type]) => !!type.isGeneric && type.name.value === returnType.name.value)

	if (!parametersOfType.length)
		return returnType

	return reader.types.intersection(...parametersOfType.map(([i]) => assignments[i].valueType))
}
