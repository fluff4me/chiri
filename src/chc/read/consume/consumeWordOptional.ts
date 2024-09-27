

import type ChiriReader from "../ChiriReader"
import type { ChiriWord } from "./consumeWord"
import consumeWord from "./consumeWord"

export default (reader: ChiriReader, ...expectedWords: string[]): ChiriWord | undefined => {
	if (expectedWords.length) {
		const restore = reader.savePosition()
		const e = reader.i
		const word = reader.consumeOptional(...expectedWords)
		if (!word || reader.isWordChar() || reader.input[reader.i] === "#") {
			reader.restorePosition(restore)
			return undefined
		}

		return {
			type: "word",
			value: word,
			position: reader.getPosition(e),
		}
	}

	return !reader.isLetter() ? undefined : consumeWord(reader)
}
