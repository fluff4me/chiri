import { STATES } from "../../../util/componentStates"
import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import type { ChiriComponentState } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponentState | undefined> => {
	const restore = reader.savePosition()
	const position = reader.getPosition()
	const states: ChiriWord[] = []
	do {
		const prefix = reader.consumeOptional(":")
		if (!prefix)
			break

		states.push(consumeWord(reader, ...STATES))
	} while (reader.consumeOptional(",") && (consumeWhiteSpaceOptional(reader) || true))

	if (!states.length) {
		reader.restorePosition(restore)
		return undefined
	}

	reader.consume(":")

	return {
		type: "component",
		subType: "state",
		states,
		...await consumeBody(reader, "state"),
		position,
	}
}
