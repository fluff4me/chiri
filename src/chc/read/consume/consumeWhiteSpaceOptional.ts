import type ChiriReader from "../ChiriReader"

export default (reader: ChiriReader, errorOnIndentation = true) => {
	let consumed = false
	for (; reader.i < reader.input.length; reader.i++)
		if (reader.input[reader.i] === " ")
			consumed = true
		else if (reader.input[reader.i] === "\t" && errorOnIndentation)
			throw reader.error("Indentation may only be used at the start of lines")
		else
			break

	return consumed
}
