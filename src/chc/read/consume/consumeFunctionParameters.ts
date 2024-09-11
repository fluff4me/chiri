import type { ChiriExpressionOperand, ChiriFunctionBase } from "../../ChiriAST"
import getFunctionParameters from "../../util/getFunctionParameters"
import assertNewLine from "../assert/assertNewLine"
import type ChiriReader from "../ChiriReader"
import { ChiriType } from "../ChiriType"
import consumeBlockEnd from "./consumeBlockEnd"
import consumeBlockStartOptional from "./consumeBlockStartOptional"
import consumeExpression from "./consumeExpression"
import consumeNewBlockLineOptional from "./consumeNewBlockLineOptional"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"
import consumeWordOptional from "./consumeWordOptional"

export default (reader: ChiriReader, start: number, fn: ChiriFunctionBase) => {
	const fnTypeSymbol = fn.type === "mixin" ? "%"
		: fn.type === "function" || fn.type === "function:internal" ? "#"
			: "???"

	const parameters = getFunctionParameters(fn)
		.sort((a, b) => +!!a.expression - +!!b.expression)

	const assignments: Record<string, ChiriExpressionOperand> = {}
	function consumeParameterAssignment () {
		const e = reader.i
		const word = consumeWordOptional(reader)
		const parameter = word && parameters.find(param => param.name.value === word.value)
		if (!parameter) {
			const expected = parameters
				.filter(param => !assignments[param.name.value])
				.map(param => `${param.expression ? "[" : ""}${ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
				.join(", ")
			if (!expected)
				throw reader.error(e, `Unexpected parameter for ${fnTypeSymbol}${fn.name.value}`)
			throw reader.error(e, `Expected parameter for ${fnTypeSymbol}${fn.name.value}, any of: ${expected}`)
		}

		if (assignments[word.value])
			throw reader.error(`Already assigned ${word.value} for ${fnTypeSymbol}${fn.name.value}`)

		const expectedType = parameter.valueType

		if (!reader.consumeOptional("=")) {
			const variableInScope = reader.getVariable(word.value)
			if (variableInScope) {
				if (!reader.types.isAssignable(variableInScope.valueType, expectedType))
					throw reader.error(e, `Unable to set ${word.value} to variable of same name, expected ${ChiriType.stringify(expectedType)}, but variable is ${ChiriType.stringify(variableInScope.valueType)}`)

				assignments[word.value] = {
					type: "get",
					name: word,
					valueType: variableInScope.valueType,
				}
				return
			}

			const valueType = ChiriType.of("bool")
			if (!reader.types.isAssignable(valueType, expectedType))
				throw reader.error(e, `Unable to set ${word.value} to true, expected ${ChiriType.stringify(expectedType)}`)

			assignments[word.value] = {
				type: "literal",
				subType: "bool",
				valueType,
				value: true,
				position: word.position,
			}
			return
		}

		assignments[word.value] = consumeExpression(reader, expectedType)
	}

	const multiline = consumeBlockStartOptional(reader)
	const consumeParameterSeparatorOptional = multiline ? consumeNewBlockLineOptional : consumeWhiteSpaceOptional
	while (consumeParameterSeparatorOptional(reader))
		consumeParameterAssignment()

	const missing = parameters.filter(parameter => !parameter.expression && !assignments[parameter.name.value])
	if (missing.length)
		throw reader.error(start, `Missing parameters for ${fnTypeSymbol}${fn.name.value}: ${parameters
			.filter(param => !assignments[param.name.value])
			.map(param => `${param.expression ? "[" : ""}${ChiriType.stringify(param.valueType)} ${param.name.value}${param.expression ? "]?" : ""}`)
			.join(", ")}`)

	if (multiline)
		consumeBlockEnd(reader)
	else
		assertNewLine(reader)

	return assignments
}
