

import type ChiriReader from "../ChiriReader"
import consumeCommentOptional from "./consumeCommentOptional"

export default (reader: ChiriReader) => {
	const e = reader.i
	consumeCommentOptional(reader)
	while (reader.consumeOptional("\r"));
	if (reader.consumeOptional("\n"))
		return true

	reader.i = e
	return false
}
