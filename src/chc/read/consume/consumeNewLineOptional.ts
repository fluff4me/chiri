

import type ChiriReader from "../ChiriReader"
import consumeCommentOptional from "./consumeCommentOptional"

export default (reader: ChiriReader) => {
	if (reader.i >= reader.input.length)
		return false

	const e = reader.i

	consumeCommentOptional(reader)
	while (reader.consumeOptional("\r"));
	if (reader.consumeOptional("\n"))
		return true

	if (reader.i >= reader.input.length)
		return true

	reader.i = e
	return false
}
