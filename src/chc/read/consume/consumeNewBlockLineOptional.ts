

import type ChiriReader from "../ChiriReader"
import consumeCommentOptional from "./consumeCommentOptional"
import consumeOptionalIndent from "./consumeIndentOptional"
import consumeOptionalNewLine from "./consumeNewLineOptional"

/**
 * Loop:
 * - Consumes newline. If not encountering a newline, return number of consumed newlines
 * - Consumes indentation to expected #
 * 	- If encountering more, throw
 * 	- If encountering less, return number of consumed newlines and return to before consuming most recent newline
 * 	- If encountering right amount
 * 		- If the rest of the line is blank, throw
 * 		- Else continue
 * @param ignoreExtraIndentation `true` to disable throwing on extra indentation
 * @returns Lines consumed
 */
export default (reader: ChiriReader, ignoreExtraIndentation = false) => {
	let consumed = 0
	while (true) {
		const iPreConsumeLine = reader.i
		if (!consumeOptionalNewLine(reader))
			// no more newlines! return the number of newlines that we consumed
			return consumed

		const iPreConsumeIndent = reader.i
		let encounteredIndent
		while (true) {
			encounteredIndent = consumeOptionalIndent(reader, reader.indent)
			if (encounteredIndent !== reader.indent) {
				if (reader.consumeOptional("\r") || reader.consumeOptional("\n"))
					continue

				reader.i = iPreConsumeLine
				return consumed
			}
			break
		}

		if (!ignoreExtraIndentation) {
			const iBeforeExtraIndentation = reader.i
			if (consumeOptionalIndent(reader))
				throw reader.error(iBeforeExtraIndentation, "Too much indentation")
		}

		const e = reader.i
		if (encounteredIndent && !consumeCommentOptional(reader) && consumeOptionalNewLine(reader)) {
			reader.i = e
			throw reader.error(iPreConsumeIndent, "Unexpected indentation on empty line")
		}

		consumed++
	}
}
