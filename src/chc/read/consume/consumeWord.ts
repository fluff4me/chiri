import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"

export interface ChiriWord<WORD extends string = string> {
	type: "word"
	value: WORD
	position: ChiriPosition
}

export default function consumeWord (reader: ChiriReader): ChiriWord
export default function consumeWord<WORD extends string> (reader: ChiriReader, ...expectedWords: WORD[]): ChiriWord<WORD>
export default function consumeWord (reader: ChiriReader, ...expectedWords: string[]): ChiriWord {
	const e = reader.i
	if (expectedWords.length) {
		const value = reader.consume(...expectedWords)
		return {
			type: "word",
			value,
			position: reader.getPosition(e),
		}
	}

	if (!reader.isLetter())
		throw reader.error("Words must start with a letter")

	const start = reader.i
	for (; reader.i < reader.input.length; reader.i++)
		if (!reader.isWordChar())
			break

	// words can't end in dashes so that you can do the decrement operator on a variable, ie `var--`
	let end = reader.i - 1
	for (; end >= 0 && reader.input[end] === "-"; end--)
		reader.i--

	const word = reader.input.slice(start, end + 1)

	if (reader.input[reader.i] === "#")
		throw reader.error(e, "This word cannot contain interpolations")

	return {
		type: "word",
		value: word,
		position: reader.getPosition(e),
	}
}
