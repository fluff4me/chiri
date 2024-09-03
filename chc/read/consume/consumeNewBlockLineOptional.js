// @ts-check

const consumeCommentOptional = require("./consumeCommentOptional");
const consumeOptionalIndent = require("./consumeIndentOptional");
const consumeOptionalNewLine = require("./consumeNewLineOptional");

/**
 * Loop:
 * - Consumes newline. If not encountering a newline, return number of consumed newlines
 * - Consumes indentation to expected #
 * 	- If encountering more, throw
 * 	- If encountering less, return number of consumed newlines and return to before consuming most recent newline
 * 	- If encountering right amount
 * 		- If the rest of the line is blank, throw
 * 		- Else continue
 * @param {import("../ChiriReader")} reader
 * @param {boolean} ignoreExtraIndentation `true` to disable throwing on extra indentation
 * @returns Lines consumed
 */
module.exports = (reader, ignoreExtraIndentation = false) => {
	let consumed = 0;
	while (true) {
		let iPreConsumeLine = reader.i;
		if (!consumeOptionalNewLine(reader))
			// no more newlines! return the number of newlines that we consumed
			return consumed;

		let iPreConsumeIndent = reader.i;
		let encounteredIndent;
		while (true) {
			encounteredIndent = consumeOptionalIndent(reader, reader.indent);
			if (encounteredIndent !== reader.indent) {
				if (reader.consumeOptional("\r") || reader.consumeOptional("\n"))
					continue;

				reader.i = iPreConsumeLine;
				return consumed;
			}
			break;
		}

		if (!ignoreExtraIndentation) {
			const iBeforeExtraIndentation = reader.i;
			if (consumeOptionalIndent(reader))
				throw reader.error(iBeforeExtraIndentation, "Too much indentation");
		}

		const e = reader.i;
		if (encounteredIndent && !consumeCommentOptional(reader) && consumeOptionalNewLine(reader)) {
			reader.i = e;
			throw reader.error(iPreConsumeIndent, "Unexpected indentation on empty line");
		}

		consumed++;
	}
};
