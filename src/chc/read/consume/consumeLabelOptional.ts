import type ChiriReader from "../ChiriReader"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"
import consumeWordOptional from "./consumeWordOptional"

export default function (reader: ChiriReader) {
	const i = reader.i
	if (!consumeWhiteSpaceOptional(reader))
		return undefined

	if (!reader.consumeOptional(":")) {
		reader.i = i
		return undefined
	}

	const label = consumeWordOptional(reader)
	if (!label) {
		reader.i = i
		return undefined
	}

	return label
}
