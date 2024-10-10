import type ChiriReader from "../read/ChiriReader"
import type { ChiriPosition } from "../read/ChiriReader"
import consumeBlockEnd from "../read/consume/consumeBlockEnd"
import consumeBlockStartOptional from "../read/consume/consumeBlockStartOptional"
import consumeNewBlockLineOptional from "../read/consume/consumeNewBlockLineOptional"
import type { ChiriLiteralString } from "../read/consume/consumeStringOptional"
import consumeStringOptional from "../read/consume/consumeStringOptional"
import consumeWhiteSpaceOptional from "../read/consume/consumeWhiteSpaceOptional"
import consumeWordInterpolated from "../read/consume/consumeWordInterpolated"
import type { ChiriWordInterpolated } from "../read/consume/consumeWordInterpolatedOptional"
import type { ChiriExpressionOperand, ChiriExpressionResult } from "../read/consume/expression/consumeExpression"
import consumeExpression from "../read/consume/expression/consumeExpression"
import { Record } from "../util/resolveExpression"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export type ChiriLiteralRecordKeyValueTuple = [key: ChiriLiteralString | ChiriWordInterpolated, value: ChiriExpressionOperand]

export interface ChiriLiteralRecord {
	type: "literal"
	subType: "record"
	valueType: ChiriType
	value: (ChiriLiteralRecordKeyValueTuple | ChiriExpressionResult)[]
	position: ChiriPosition
}

const TYPE_RECORD = ChiriType.of("record", "*")
export default TypeDefinition({
	type: TYPE_RECORD,
	stringable: true,
	generics: 1,
	consumeOptionalConstructor: (reader): ChiriLiteralRecord | undefined => {
		const position = reader.getPosition()
		if (!reader.consumeOptional("{"))
			return undefined

		const expressions: (ChiriLiteralRecordKeyValueTuple | ChiriExpressionResult)[] = []
		const multiline = consumeBlockStartOptional(reader)
		if (!multiline) {
			consumeWhiteSpaceOptional(reader)
			do expressions.push(consumeOptionalSpread(reader) ?? consumeRecordKeyValue(reader))
			while (reader.consumeOptional(", "))

		} else {
			do expressions.push(consumeOptionalSpread(reader) ?? consumeRecordKeyValue(reader))
			while (consumeNewBlockLineOptional(reader))

			consumeBlockEnd(reader)
		}

		const valueTypes = expressions.map(expr => Array.isArray(expr) ? expr[1].valueType : expr.valueType)
		const stringifiedTypes = valueTypes.map(valueType => ChiriType.stringify(valueType))
		if (new Set(stringifiedTypes).size > 1)
			throw reader.error(`Records can only contain a single type. This record contains: ${stringifiedTypes.join(", ")}`)

		if (!multiline) {
			consumeWhiteSpaceOptional(reader)
			reader.consumeOptional("}")
		}

		return {
			type: "literal",
			subType: "record",
			valueType: ChiriType.of("record", valueTypes[0] ?? "*"),
			value: expressions,
			position,
		}
	},
	is: value => Record.is(value),
})

function consumeOptionalSpread (reader: ChiriReader): ChiriExpressionOperand | undefined {
	if (!reader.consumeOptional("..."))
		return undefined

	return consumeExpression.inline(reader, TYPE_RECORD)
}

function consumeRecordKeyValue (reader: ChiriReader): ChiriLiteralRecordKeyValueTuple {
	const key = consumeStringOptional(reader) ?? consumeWordInterpolated(reader, true)
	reader.consume(":")
	consumeWhiteSpaceOptional(reader)
	const expr = consumeExpression.inline(reader)
	return [key, expr]
}
