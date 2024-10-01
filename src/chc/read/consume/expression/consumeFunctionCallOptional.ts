import { ChiriType } from "../../../type/ChiriType"
import getFunctionParameters from "../../../util/getFunctionParameters"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
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
	const fn = name && reader.getFunctionOptional(name.value)
	if (!fn) {
		reader.restorePosition(restore)
		return undefined
	}

	const parameters = getFunctionParameters(fn)

	const variableSharingName = reader.getVariableOptional(name.value)
	if (variableSharingName && parameters.length && !reader.consumeOptional("(")) {
		reader.restorePosition(restore)
		return undefined
	}

	if (!parameters.length && !reader.peek("("))
		throw reader.error(e, `Ambiguous usage of name "${name.value}" — could be #${ChiriType.stringify(reader.getVariable(name.value).valueType)} ${name.value} or #function ${name.value} returns ${ChiriType.stringify(fn.returnType)}`)

	return consumePartialFuntionCall(reader, position, name, fn, parameters, ...expectedTypes)
}

export function consumePartialFuntionCall (reader: ChiriReader, position: ChiriPosition, name: ChiriWord, fn: ChiriFunction, parameters: ChiriCompilerVariable[], ...expectedTypes: ChiriType[]): ChiriFunctionCall {
	const assignments: Record<string, ChiriExpressionOperand> = {}
	if (parameters.length) {
		reader.consume("(")
		for (let i = 0; i < parameters.length; i++) {
			const parameter = parameters[i]
			if (i > 0) {
				if (!reader.consumeOptional(",") && parameter.assignment !== "??=") {
					const missingParameters = parameters.slice(i)
						.map(param => `${param.expression ? "[" : ""}${ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
						.join(", ")
					throw reader.error(`Missing parameters for #function ${fn.name.value}: ${missingParameters}`)
				}

				consumeWhiteSpaceOptional(reader)
			}

			if (reader.peek(")")) {
				const missingParameters = parameters.slice(i)
					.filter(param => !param.assignment)
					.map(param => `${param.expression ? "[" : ""}${ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
					.join(", ")

				if (missingParameters)
					throw reader.error(`Missing required parameters for #function ${fn.name.value}: ${missingParameters}`)

				break
			}

			const expectedType = [parameter.valueType]
			if (parameter.assignment === "??=")
				expectedType.push(ChiriType.of("undefined"))

			assignments[parameter.name.value] = consumeExpression.inline(reader, ...expectedType)
		}

		reader.consumeOptional(")")

	} else if (reader.consumeOptional("(")) {
		reader.consumeOptional(")")
	}

	const returnType = resolveReturnType(reader, fn, assignments)
	if (!reader.types.isAssignable(returnType, ...expectedTypes))
		throw reader.error(`Expected ${expectedTypes.map(type => `"${ChiriType.stringify(type)}"`).join(", ")}, but #${fn.name.value} will return "${ChiriType.stringify(returnType)}"`)

	return {
		type: "function-call",
		name,
		assignments,
		valueType: returnType,
		position,
	}
}

function resolveReturnType (reader: ChiriReader, fn: ChiriFunction, assignments: Record<string, ChiriExpressionOperand>): ChiriType {
	if (!fn.returnType.isGeneric)
		return fn.returnType

	const parametersOfType = fn.content.filter((statement): statement is ChiriCompilerVariable => statement.type === "variable" && !!statement.valueType.isGeneric && statement.valueType.name.value === fn.returnType.name.value)
	return reader.types.intersection(...parametersOfType.map(parameter => assignments[parameter.name.value].valueType))
}
