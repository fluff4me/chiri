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

	let word = reader.input[reader.i++]
	for (; reader.i < reader.input.length; reader.i++)
		if (reader.isWordChar() && (reader.input[reader.i] !== "-" || reader.input[reader.i + 1] !== ">"))
			word += reader.input[reader.i]
		else
			break

	if (reader.input[reader.i] === "#")
		throw reader.error(e, "This word cannot contain interpolations")

	return {
		type: "word",
		value: word,
		position: reader.getPosition(e),
	}
}
