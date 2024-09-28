import { ChiriType } from "../../../type/ChiriType"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
import consumeFunctionParameters from "../consumeFunctionParameters"
import consumeWhiteSpace from "../consumeWhiteSpace"
import type { ChiriWord } from "../consumeWord"
import consumeWordOptional from "../consumeWordOptional"
import type { ChiriFunction } from "../macro/macroFunctionDeclaration"
import type { ChiriExpressionOperand } from "./consumeExpression"

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
	const start = reader.i
	if (!reader.consumeOptional("#"))
		return undefined

	const name = consumeWordOptional(reader)
	const fn = name && reader.getFunctionOptional(name.value)
	if (!fn) {
		reader.restorePosition(restore)
		return undefined
	}

	consumeWhiteSpace(reader)

	const assignments = consumeFunctionParameters(reader, start, fn)

	const returnType = resolveReturnType(reader, fn, assignments)
	if (!reader.types.isAssignable(returnType, ...expectedTypes))
		throw reader.error(`Expected ${expectedTypes.map(type => `"${ChiriType.stringify(type)}"`).join(", ")}, but #${fn.name.value} will return "${ChiriType.stringify(returnType)}"`)

	return {
		type: "function-call",
		name,
		assignments,
		valueType: fn.returnType,
		position,
	}
}

function resolveReturnType (reader: ChiriReader, fn: ChiriFunction, assignments: Record<string, ChiriExpressionOperand>): ChiriType {
	if (!fn.returnType.isGeneric)
		return fn.returnType

	const parametersOfType = fn.content.filter((statement): statement is ChiriCompilerVariable => statement.type === "variable" && !!statement.valueType.isGeneric && statement.valueType.name.value === fn.returnType.name.value)
	return reader.types.intersection(...parametersOfType.map(parameter => assignments[parameter.name.value].valueType))
}
