import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import type { ChiriComponent } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponent | undefined> => {
	const position = reader.getPosition()
	const e = reader.i
	const pseudoElements: ChiriWord[] = []
	do {
		const prefix = reader.consumeOptional("@")
		if (!prefix)
			break

		pseudoElements.push(consumeWord(reader, "before", "after"))
	} while (reader.consumeOptional(",") && (consumeWhiteSpaceOptional(reader) || true))

	if (!pseudoElements.length)
		return undefined

	const duplicates = new Set(pseudoElements.map(e => e.value))
	if (pseudoElements.length > 2 || duplicates.size !== pseudoElements.length)
		throw reader.error(e, "Duplicate pseudoelement selector")

	reader.consume(":")

	return {
		type: "component",
		className: undefined,
		states: [],
		pseudoElements,
		...await consumeBody(reader, "pseudo"),
		position,
	}
}
