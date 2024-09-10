import type { ChiriExpressionOperand, ChiriFunctionBase } from "../../ChiriAST"
import getFunctionParameters from "../../util/getFunctionParameters"
import assertNewLine from "../assert/assertNewLine"
import type ChiriReader from "../ChiriReader"
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
				.map(param => `${param.expression ? "[" : ""}${param.valueType} ${param.name.value}${param.expression ? "]?" : ""}`)
				.join(", ")
			if (!expected)
				throw reader.error(e, `Unexpected parameter for ${fnTypeSymbol}${fn.name.value}`)
			throw reader.error(e, `Expected parameter for ${fnTypeSymbol}${fn.name.value}, any of: ${expected}`)
		}

		if (assignments[word.value])
			throw reader.error(`Already assigned  #${word.value} for ${fnTypeSymbol}${fn.name.value}`)

		const expectedType = parameter.valueType

		if (!reader.consumeOptional("=")) {
			if (!reader.types.isAssignable("bool", expectedType))
				throw reader.error(e, `Unable to set #${word.value} to true, expected ${expectedType}`)

			assignments[word.value] = {
				type: "literal",
				subType: "boolean",
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
			.map(param => `${param.expression ? "[" : ""}${param.valueType} ${param.name.value}${param.expression ? "]?" : ""}`)
			.join(", ")}`)

	if (multiline)
		consumeBlockEnd(reader)
	else
		assertNewLine(reader)

	return assignments
}
