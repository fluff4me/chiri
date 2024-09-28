

import { ChiriType } from "../../../type/ChiriType"
import type ChiriReader from "../../ChiriReader"
import consumeUnsignedIntegerOptional from "./consumeUnsignedIntegerOptional"
import type { ChiriLiteralNumeric } from "./Numeric"

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
