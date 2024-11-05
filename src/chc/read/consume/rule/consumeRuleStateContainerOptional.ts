import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeValueText from "../consumeValueText"
import consumeWhiteSpace from "../consumeWhiteSpace"
import consumeWordOptional from "../consumeWordOptional"
import type { ChiriComponentStateContainer } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponentStateContainer | undefined> => {
	const restore = reader.savePosition()
	const prefix = reader.consumeOptional(":", "&:")
	if (!prefix)
		return

	const position = reader.getPosition()
	if (!consumeWordOptional(reader, "container")) {
		reader.restorePosition(restore)
		return undefined
	}

	consumeWhiteSpace(reader)

	const query = consumeValueText(reader, false, () => !!reader.peek(":"))
	reader.consume(":")

	return {
		type: "component",
		subType: "container",
		spread: prefix === "&:",
		query,
		...await consumeBody(reader, "state"),
		position,
	}
}
