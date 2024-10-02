import { STATES } from "../../../util/componentStates"
import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import type { ChiriComponent } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponent | undefined> => {
	const position = reader.getPosition()
	const states: ChiriWord[] = []
	do {
		const prefix = reader.consumeOptional(":")
		if (!prefix)
			break

		states.push(consumeWord(reader, ...STATES))
	} while (reader.consumeOptional(",") && (consumeWhiteSpaceOptional(reader) || true))

	if (!states.length)
		return undefined

	reader.consume(":")

	return {
		type: "component",
		className: undefined,
		states,
		...await consumeBody(reader, "state"),
		position,
	}
}
