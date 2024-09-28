

import type ChiriReader from "../ChiriReader"
import type { ChiriPosition, ChiriStatement } from "../ChiriReader"
import consumeBody from "./consumeBody"
import consumeWordInterpolated from "./consumeWordInterpolated"
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional"

export interface ChiriMixin {
	type: "mixin"
	name: ChiriWordInterpolated
	content: ChiriStatement[]
	position: ChiriPosition
}

export default async (reader: ChiriReader): Promise<ChiriMixin | undefined> => {
	const position = reader.getPosition()
	const restore = reader.savePosition()
	if (!reader.consumeOptional("%"))
		return undefined

	const name = consumeWordInterpolated(reader)

	if (!reader.consumeOptional(":")) {
		reader.restorePosition(restore)
		return undefined
	}

	return {
		type: "mixin",
		name,
		...await consumeBody(reader, "mixin"),
		position,
	}
}
