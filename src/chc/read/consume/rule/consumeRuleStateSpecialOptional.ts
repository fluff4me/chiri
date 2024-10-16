import { STATES_SPECIAL } from "../../../util/componentStates"
import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeWordOptional from "../consumeWordOptional"
import type { ChiriComponentStateSpecial } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponentStateSpecial | undefined> => {
	const restore = reader.savePosition()
	const prefix = reader.consumeOptional(":")
	if (!prefix)
		return

	const position = reader.getPosition()
	const state = consumeWordOptional(reader, ...STATES_SPECIAL)
	if (!state) {
		reader.restorePosition(restore)
		return undefined
	}

	reader.consume(":")

	return {
		type: "component",
		subType: "state-special",
		state,
		...await consumeBody(reader, "state"),
		position,
	}
}
