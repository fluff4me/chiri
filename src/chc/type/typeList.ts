import type ChiriReader from "../read/ChiriReader"
import type { ChiriPosition } from "../read/ChiriReader"
import consumeBlockEnd from "../read/consume/consumeBlockEnd"
import consumeBlockStartOptional from "../read/consume/consumeBlockStartOptional"
import consumeNewBlockLineOptional from "../read/consume/consumeNewBlockLineOptional"
import consumeWhiteSpaceOptional from "../read/consume/consumeWhiteSpaceOptional"
import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression"
import consumeExpression from "../read/consume/expression/consumeExpression"
import type { ChiriLiteralRange } from "../read/consume/expression/consumeRangeOptional"
import consumeRangeOptional from "../read/consume/expression/consumeRangeOptional"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export interface ChiriLiteralListSpread {
	type: "list-spread"
	value: ChiriExpressionOperand
	position: ChiriPosition
}

export interface ChiriLiteralList {
	type: "literal"
	subType: "list"
	valueType: ChiriType
	value: (ChiriExpressionOperand | ChiriLiteralListSpread)[]
	position: ChiriPosition
}

const TYPE_LIST = ChiriType.of("list", "*")
export default TypeDefinition({
	type: TYPE_LIST,
	stringable: true,
	generics: 1,
	consumeOptionalConstructor: (reader): ChiriLiteralList | ChiriLiteralRange | undefined =>
		consumeLiteralList(reader) ?? consumeRangeOptional(reader),
	coerce: value => Array.isArray(value) ? value : [value],
	is: value => Array.isArray(value),
})

function consumeLiteralList (reader: ChiriReader): ChiriLiteralList | undefined {
	const position = reader.getPosition()
	if (!reader.consumeOptional("["))
		return undefined

	const expressions: (ChiriExpressionOperand | ChiriLiteralListSpread)[] = []
	const multiline = consumeBlockStartOptional(reader)
	if (!multiline) {
		if (!reader.peek("\r\n", "\n")) {
			consumeWhiteSpaceOptional(reader)
			do expressions.push(consumeOptionalSpread(reader) ?? consumeExpression.inline(reader))
			while (reader.consumeOptional(", "))
		}

	} else {
		do expressions.push(consumeOptionalSpread(reader) ?? consumeExpression.inline(reader))
		while (consumeNewBlockLineOptional(reader))

		consumeBlockEnd(reader)
	}

	const valueTypes = expressions.map(expr => expr.type === "list-spread" ? expr.value.valueType.generics[0] : expr.valueType)
	const stringifiedTypes = valueTypes.map(type => ChiriType.stringify(type))
	if (new Set(stringifiedTypes).size > 1 && !reader.types.isEveryType(valueTypes))
		throw reader.error(`Lists can only contain a single type. This list contains:\n  - ${stringifiedTypes.join("\n  - ")}`)

	if (!multiline) {
		consumeWhiteSpaceOptional(reader)
		reader.consumeOptional("]")
	}

	return {
		type: "literal",
		subType: "list",
		valueType: ChiriType.of("list", valueTypes[0] ?? "*"),
		value: expressions,
		position,
	}
}

function consumeOptionalSpread (reader: ChiriReader): ChiriLiteralListSpread | undefined {
	const position = reader.getPosition()
	if (!reader.consumeOptional("..."))
		return undefined

	return {
		type: "list-spread",
		value: consumeExpression.inline(reader, TYPE_LIST),
		position,
	}
}
