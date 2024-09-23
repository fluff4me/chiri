

import type ChiriReader from "../ChiriReader"
import type { ChiriStatement } from "../ChiriReader"
import consumeBody from "./consumeBody"
import consumeWord, { type ChiriWord } from "./consumeWord"

export interface ChiriMixin {
	type: "mixin"
	name: ChiriWord
	content: ChiriStatement[]
	used: boolean
}

export default async (reader: ChiriReader): Promise<ChiriMixin | undefined> => {
	const savedPosition = reader.savePosition()
	if (!reader.consumeOptional("%"))
		return undefined

	const name = consumeWord(reader)

	if (!reader.consumeOptional(":")) {
		reader.restorePosition(savedPosition)
		return undefined
	}

	return {
		type: "mixin",
		name,
		used: false,
		...await consumeBody(reader, "mixin"),
	}
}
