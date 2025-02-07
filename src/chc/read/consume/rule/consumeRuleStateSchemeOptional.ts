import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeWhiteSpace from "../consumeWhiteSpace"
import consumeWord from "../consumeWord"
import consumeWordOptional from "../consumeWordOptional"
import type { ChiriComponentStateScheme } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponentStateScheme | undefined> => {
	const restore = reader.savePosition()
	const prefix = reader.consumeOptional(":", "&:")
	if (!prefix)
		return

	const position = reader.getPosition()
	if (!consumeWordOptional(reader, "scheme")) {
		reader.restorePosition(restore)
		return undefined
	}

	consumeWhiteSpace(reader)

	const scheme = consumeWord(reader, "dark", "light")
	reader.consume(":")

	return {
		type: "component",
		subType: "scheme",
		spread: prefix === "&:",
		scheme: scheme.value,
		...await consumeBody(reader, "state"),
		position,
	}
}
