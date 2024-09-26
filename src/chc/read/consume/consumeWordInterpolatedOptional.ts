

import type ChiriReader from "../ChiriReader"
import { ChiriType } from "../ChiriType"
import type { ChiriInterpolationVariable, ChiriTextRaw, ChiriValueText } from "./consumeValueText"
import consumeExpression, { type ChiriExpressionOperand } from "./expression/consumeExpression"

export interface ChiriWordInterpolated extends ChiriValueText {
	content: (ChiriTextRaw | ChiriInterpolationVariable | ChiriExpressionOperand | string)[]
}

export default (reader: ChiriReader): ChiriWordInterpolated | undefined => {
	const e = reader.i

	if (!reader.isLetter() && !reader.peek("#{"))
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
		valueType: ChiriType.of("string"),
		content,
		position: start,
	}
}
