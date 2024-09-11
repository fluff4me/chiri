

import type { ChiriLiteralNumeric } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import { ChiriType } from "../ChiriType"
import consumeUnsignedIntegerOptional from "./consumeUnsignedIntegerOptional"

export default (reader: ChiriReader): ChiriLiteralNumeric | undefined => {
	const e = reader.i
	const position = reader.getPosition(e)
	const negative = reader.consumeOptional("-") ?? ""
	const numeric = consumeUnsignedIntegerOptional(reader)
	if (!numeric)
		reader.i = e

	return !numeric ? undefined : {
		type: "literal",
		subType: "int",
		valueType: ChiriType.of("int"),
		value: negative + numeric.value,
		position,
	}
}
