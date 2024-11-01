import type { ComponentState } from "../../../util/componentStates"
import { STATE_MAP, STATES } from "../../../util/componentStates"
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

		const state: ChiriWord = consumeWord(reader, ...STATES, "not")
		if (state.value === "not") {
			while (consumeWhiteSpaceOptional(reader)) {
				reader.consume(":")
				const substate = reader.consume(...STATES)
				state.value += ` ${STATE_MAP[substate]}`
			}

			state.value = `:not(${state.value.slice(4).replaceAll(" ", ",")})`
		} else {
			state.value = STATE_MAP[state.value as ComponentState].replaceAll(" ", ",")
		}

		states.push(state)

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
