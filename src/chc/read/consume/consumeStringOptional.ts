import { INTERNAL_POSITION } from "../../../constants"
import assertNotWhiteSpaceAndNewLine from "../assert/assertNotWhiteSpaceAndNewLine"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import { ChiriType } from "../ChiriType"
import consumeBlockEnd from "./consumeBlockEnd"
import consumeBlockStartOptional from "./consumeBlockStartOptional"
import type { ChiriExpressionOperand } from "./consumeExpression"
import consumeIndentOptional from "./consumeIndentOptional"
import consumeNewBlockLineOptional from "./consumeNewBlockLineOptional"
import consumeWordOptional from "./consumeWordOptional"

export interface ChiriLiteralString {
	type: "literal"
	subType: "string"
	valueType: ChiriType
	segments: (string | ChiriExpressionOperand)[]
	position: ChiriPosition
}

export default (reader: ChiriReader): ChiriLiteralString | undefined => {
	const position = reader.getPosition()
	if (!reader.consumeOptional('"'))
		return undefined

	assertNotWhiteSpaceAndNewLine(reader)

	const block = consumeBlockStartOptional(reader)

	const segments: ChiriLiteralString["segments"] = [""]
	let pendingNewlines = ""
	String: for (; reader.i < reader.input.length; reader.i++) {
		if (block)
			pendingNewlines += "\\n".repeat(consumeNewBlockLineOptional(reader, true))

		const appendSegment = (text: string) =>
			(segments[segments.length - 1] as string) += text

		const char = reader.input[reader.i]
		switch (char) {
			case "\\": {
				reader.i++
				if (consumeNewBlockLineOptional(reader, true)) {
					consumeIndentOptional(reader)
					reader.i--
					break
				}

				const escapeChar = reader.input[reader.i]
				switch (escapeChar) {
					case "r":
					case "n":
					case "t":
					case "\\":
					case "$":
						appendSegment(pendingNewlines + char + escapeChar)
						pendingNewlines = ""
						break
					case '"':
						appendSegment(pendingNewlines + escapeChar)
						pendingNewlines = ""
						break
					default:
						throw reader.error("Unexpected escape character")
				}
				break
			}
			case "$":
			case "`":
				appendSegment(pendingNewlines + `\\${char}`)
				pendingNewlines = ""
				break
			case "*": {
				const e = reader.i
				reader.i++
				const word = consumeWordOptional(reader)
				if (!word) {
					reader.i--
					appendSegment(pendingNewlines + "*")
					pendingNewlines = ""
					break
				}

				reader.i--
				const variable = reader.getVariable(word.value)
				const valueType = variable.valueType
				if (!valueType || !reader.getType(valueType).stringable)
					throw reader.error(e, `Type '${ChiriType.stringify(valueType)}' is not stringable`)

				appendSegment(pendingNewlines)
				pendingNewlines = ""

				segments.push({
					type: "get",
					valueType,
					name: word,
				}, "")
				break
			}
			case "\r":
				break
			case "\n":
				break String
			case "\t":
				pendingNewlines += pendingNewlines + "\\t"
				break
			case "\"":
				if (!block) {
					reader.i++
					break String
				}
			// maybe intentional fallthrough? this should be investigated
			default:
				appendSegment(pendingNewlines + char)
				pendingNewlines = ""
		}
	}

	if (block)
		consumeBlockEnd(reader)

	return {
		type: "literal",
		subType: "string",
		valueType: { type: "type", name: { type: "word", value: "string", position: INTERNAL_POSITION }, generics: [] },
		segments,
		position,
	}
}
