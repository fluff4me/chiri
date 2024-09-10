import type { ChiriFunctionUse, ChiriValueText } from "../../../ChiriAST"
import type ChiriReader from "../../ChiriReader"
import consumeBlockStartOptional from "../consumeBlockStartOptional"
import consumeNewBlockLineOptional from "../consumeNewBlockLineOptional"
import consumeValue from "../consumeValue"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"

export default (reader: ChiriReader): ChiriFunctionUse | undefined => {
	if (!reader.consumeOptional("#debug"))
		return undefined

	reader.consume(":")

	const toDebug: ChiriValueText[] = []
	const multiline = consumeBlockStartOptional(reader)
	if (!multiline) {
		consumeWhiteSpaceOptional(reader)
		toDebug.push(consumeValue(reader, false))
	} else
		while (consumeNewBlockLineOptional(reader))
			toDebug.push(consumeValue(reader, false))

	return {
		type: "function-use",
		name: { type: "word", value: "debug", position: { file: "internal", line: 0, column: 0 } },
		variables: { content: { type: "literal", subType: "array", valueType: "*", value: toDebug } },
		content: [],
	}
}
