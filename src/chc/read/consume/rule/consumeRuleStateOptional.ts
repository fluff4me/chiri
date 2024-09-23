import { STATES } from "../../../util/componentStates"
import type ChiriReader from "../../ChiriReader"
import { ChiriType } from "../../ChiriType"
import consumeBody from "../consumeBody"
import type { ChiriRule } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriRule | undefined> => {
	const prefix = reader.consumeOptional(":")
	if (!prefix)
		return undefined

	const position = reader.getPosition()
	const state = reader.consume(...STATES)

	reader.consume(":")

	return {
		type: "rule",
		className: undefined,
		state: {
			type: "text",
			valueType: ChiriType.of("string"),
			content: [{ type: "text-raw", text: state, position }],
			position,
		},
		...await consumeBody(reader, "rule"),
	}
}
