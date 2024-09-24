

import type ChiriReader from "../ChiriReader"
import type { ChiriWord } from "./consumeWord"
import consumeWord from "./consumeWord"

export default (reader: ChiriReader, ...expectedWords: string[]): ChiriWord | undefined => {
	if (expectedWords.length) {
		const e = reader.i
		const word = reader.consumeOptional(...expectedWords)
		return !word ? undefined : {
			type: "word",
			value: word,
			position: reader.getPosition(e),
		}
	}

	return !expectedWords.length && !reader.isLetter() ? undefined : consumeWord(reader, ...expectedWords)
}
