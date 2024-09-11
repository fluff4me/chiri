import type { ChiriLiteralNumeric } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import { ChiriType } from "../ChiriType"

export default (reader: ChiriReader): ChiriLiteralNumeric | undefined => {
	const i = reader.i
	let intStr = ""
	for (; reader.i < reader.input.length; reader.i++)
		if (reader.isDigit())
			intStr += reader.input[reader.i]
		else
			break

	if (!intStr.length)
		return undefined

	return {
		type: "literal",
		subType: "uint",
		valueType: ChiriType.of("uint"),
		value: intStr,
		position: reader.getPosition(i),
	}
}
