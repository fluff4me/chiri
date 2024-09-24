import { STATES } from "../../../util/componentStates"
import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeWord from "../consumeWord"
import type { ChiriComponent } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponent | undefined> => {
	const prefix = reader.consumeOptional(":")
	if (!prefix)
		return undefined

	const position = reader.getPosition()
	const state = consumeWord(reader, ...STATES)

	reader.consume(":")

	return {
		type: "component",
		className: undefined,
		state,
		...await consumeBody(reader, "state"),
		position,
	}
}
