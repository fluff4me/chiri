import { INTERNAL_POSITION } from "../../../constants"
import { ChiriType } from "../../type/ChiriType"
import assertNotWhiteSpaceAndNewLine from "../assert/assertNotWhiteSpaceAndNewLine"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import consumeBlockEnd from "./consumeBlockEnd"
import consumeBlockStartOptional from "./consumeBlockStartOptional"
import consumeCustomPropertyInterpolation from "./consumeCustomPropertyInterpolation"
import consumeIndentOptional from "./consumeIndentOptional"
import consumeNewBlockLineOptional from "./consumeNewBlockLineOptional"
import type { ChiriExpressionOperand } from "./expression/consumeExpression"
import consumeExpression from "./expression/consumeExpression"

export interface ChiriLiteralString {
	type: "literal"
	subType: "string"
	valueType: ChiriType
	segments: (string | ChiriExpressionOperand)[]
	position: ChiriPosition
}

export default (reader: ChiriReader): ChiriLiteralString | undefined => {
	const position = reader.getPosition()
	if (reader.consumeOptional("$")) {
		const isName = reader.consumeOptional("$")
		const varType = isName ? "$$" as const : "$" as const
		return {
			type: "literal",
			subType: "string",
			valueType: ChiriType.of("string"),
			segments: [
				{
					type: "text",
					valueType: ChiriType.of("string"),
					content: [
						consumeCustomPropertyInterpolation(reader, varType),
					],
					position,
				},
			],
			position,
		}
	}

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
			case "$": {
				appendSegment(pendingNewlines)
				pendingNewlines = ""

				reader.i++
				const isName = reader.consumeOptional("$")
				const varType = isName ? "$$" as const : "$" as const
				segments.push({
					type: "literal",
					subType: "string",
					valueType: ChiriType.of("string"),
					segments: [
						{
							type: "text",
							valueType: ChiriType.of("string"),
							content: [
								consumeCustomPropertyInterpolation(reader, varType),
							],
							position,
						},
					],
					position,
				})

				segments.push("")
				reader.i--
				break
			}
			// case "$":
			// case "`":
			// 	appendSegment(pendingNewlines + `\\${char}`)
			// 	pendingNewlines = ""
			// 	break
			case "#": {
				if (reader.input[reader.i + 1] !== "{") {
					appendSegment(pendingNewlines + `${char}`)
					pendingNewlines = ""
					break
				}

				reader.i += 2

				appendSegment(pendingNewlines)
				pendingNewlines = ""
				const expr = consumeExpression.inline(reader)
				segments.push(expr)
				segments.push("")
				reader.consume("}")
				reader.i--
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
