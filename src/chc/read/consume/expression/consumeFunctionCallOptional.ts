import { ChiriType } from "../../../type/ChiriType"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWordOptional from "../consumeWordOptional"
import type { ChiriFunction } from "../macro/macroFunctionDeclaration"
import type { ChiriExpressionOperand } from "./consumeExpression"
import consumeExpression from "./consumeExpression"

export interface ChiriFunctionCall {
	type: "function-call"
	name: ChiriWord
	assignments: Record<string, ChiriExpressionOperand>
	valueType: ChiriType
	position: ChiriPosition
}

export default (reader: ChiriReader, ...expectedTypes: ChiriType[]): ChiriFunctionCall | undefined => {
	const position = reader.getPosition()
	const restore = reader.savePosition()

	const name = consumeWordOptional(reader)
	const fn = name && reader.getFunctionOptional(name.value)
	if (!fn) {
		reader.restorePosition(restore)
		return undefined
	}

	const assignments: Record<string, ChiriExpressionOperand> = {}
	const parameters = fn.content.filter((statement): statement is ChiriCompilerVariable => statement.type === "variable" && statement.assignment !== "=")

	const variableSharingName = reader.getVariableOptional(name.value)
	if (variableSharingName && parameters.length && !reader.consumeOptional("(")) {
		reader.restorePosition(restore)
		return undefined
	}

	if (parameters.length) {
		reader.consume("(")
		for (const parameter of parameters) {
			if (parameter !== parameters[0]) {
				reader.consume(",")
				consumeWhiteSpaceOptional(reader)
			}

			assignments[parameter.name.value] = consumeExpression.inline(reader, parameter.valueType)
		}

		reader.consumeOptional(")")

	} else if (reader.consumeOptional("(")) {
		reader.consumeOptional(")")

	} else if (variableSharingName) {
		throw reader.error(`Ambiguous usage of name "${name.value}" — could be #${ChiriType.stringify(reader.getVariable(name.value).valueType)} ${name.value} or #function ${name.value} returns ${ChiriType.stringify(fn.returnType)}`)
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
