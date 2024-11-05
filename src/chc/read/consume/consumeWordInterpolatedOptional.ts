

import { ChiriType } from "../../type/ChiriType"
import type ChiriReader from "../ChiriReader"
import type { ChiriBaseText, ChiriInterpolationVariable, ChiriTextRaw } from "./consumeValueText"
import consumeExpression, { type ChiriExpressionOperand } from "./expression/consumeExpression"

export interface ChiriWordInterpolated extends ChiriBaseText {
	subType: "word-interpolated"
	content: (ChiriTextRaw | ChiriInterpolationVariable | ChiriExpressionOperand | string)[]
}

export default (reader: ChiriReader, skipStartRequirements = false): ChiriWordInterpolated | undefined => {
	const e = reader.i

	if (!reader.isLetter() && !reader.peek("#{") && (!skipStartRequirements || (!reader.peek("-") && !reader.isDigit())))
		return undefined

	const content: ChiriWordInterpolated["content"] = []

	const start = reader.getPosition()
	let textStart = start
	let text = ""
	for (; reader.i < reader.input.length;) {
		if (reader.isWordChar()) {
			text += reader.input[reader.i++]
			continue
		}

		if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] !== "{")
			break

		if (text)
			content.push({
				type: "text-raw",
				position: textStart,
				text,
			})

		reader.consume("#{")
		content.push(consumeExpression.inline(reader))
		reader.consume("}")

		text = ""
		textStart = reader.getPosition()
	}

	if (text)
		content.push({
			type: "text-raw",
			position: textStart,
			text,
		})

	return {
		type: "text",
		subType: "word-interpolated",
		valueType: ChiriType.of("string"),
		content,
		position: start,
	}
}
