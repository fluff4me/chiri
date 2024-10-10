import { ChiriType } from "../../../type/ChiriType"
import typeInt from "../../../type/typeInt"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
import consumeWordOptional from "../consumeWordOptional"
import consumeIntegerOptional from "../numeric/consumeIntegerOptional"
import type { ChiriLiteralNumeric } from "../numeric/Numeric"
import type { ChiriVariableReference } from "./consumeExpression"

export interface ChiriLiteralRange {
	type: "literal"
	subType: "range"
	valueType: ChiriType
	start?: ChiriLiteralNumeric | ChiriVariableReference
	end?: ChiriLiteralNumeric | ChiriVariableReference
	inclusive?: true
	position: ChiriPosition
}

export default function (reader: ChiriReader, listSlice?: true): ChiriLiteralRange | undefined {
	const restore = reader.savePosition()
	const position = reader.getPosition()
	const start = consumeRangeBound(reader)
	const operator = reader.consumeOptional("...", "..")
	const end = operator && consumeRangeBound(reader)
	if (!operator || (!end && !listSlice)) {
		reader.restorePosition(restore)
		return undefined
	}

	return {
		type: "literal",
		subType: "range",
		start,
		end,
		inclusive: operator === "..." ? true : undefined,
		valueType: ChiriType.of("list", "int"),
		position,
	}
}

function consumeRangeBound (reader: ChiriReader): ChiriLiteralNumeric | ChiriVariableReference | undefined {
	const int = consumeIntegerOptional(reader)
	if (int)
		return int

	const varName = consumeWordOptional(reader)
	if (!varName)
		return undefined

	const position = reader.getPosition()
	const variable = reader.getVariableOptional(varName.value)
	if (!variable || !reader.types.isAssignable(variable.valueType, typeInt.type))
		return undefined

	return {
		type: "get",
		name: varName,
		valueType: variable.valueType,
		position,
	}
}
