

import type { ChiriText } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import { ChiriType } from "../ChiriType"
import consumeExpression from "./consumeExpression"

export default (reader: ChiriReader): ChiriText | undefined => {
	const e = reader.i

	if (!reader.isLetter() && !reader.peek("#{"))
		return undefined

	const content: ChiriText["content"] = []

	const start = reader.getPosition()
	let textStart = start
	let text = ""
	for (; reader.i < reader.input.length; reader.i++) {
		if (reader.isWordChar()) {
			text += reader.input[reader.i]
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
		content.push(consumeExpression(reader))
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
