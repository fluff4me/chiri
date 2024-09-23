import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"

export interface ChiriWord {
	type: "word"
	value: string
	position: ChiriPosition
}

export default (reader: ChiriReader, expectedWord?: string): ChiriWord => {
	const e = reader.i
	if (expectedWord) {
		return {
			type: "word",
			value: reader.consume(expectedWord),
			position: reader.getPosition(e),
		}
	}

	if (!reader.isLetter())
		throw reader.error("Words must start with a letter")

	let word = reader.input[reader.i++]
	for (; reader.i < reader.input.length; reader.i++)
		if (reader.isWordChar())
			word += reader.input[reader.i]
		else
			break

	return {
		type: "word",
		value: word,
		position: reader.getPosition(e),
	}
}
