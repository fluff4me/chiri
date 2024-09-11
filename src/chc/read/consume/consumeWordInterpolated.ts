

import type { ChiriText } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import { ChiriType } from "../ChiriType"
import consumeExpression from "./consumeExpression"
import consumeWord from "./consumeWord"

export default (reader: ChiriReader): ChiriText => {
	const e = reader.i

	if (!reader.isLetter() && !reader.consumeOptional("#"))
		throw reader.error("Words must start with a letter")

	const content: ChiriText["content"] = []

	let textStart = reader.getPosition()
	let text = reader.input[reader.i++]
	for (; reader.i < reader.input.length; reader.i++) {
		if (reader.isWordChar()) {
			text += reader.input[reader.i]
			continue
		}

		if (reader.input[reader.i] !== "#")
			break

		if (text)
			content.push({
				type: "text-raw",
				position: textStart,
				text,
			})

		if (reader.input[reader.i + 1] === "{") {
			reader.consume("#{")
			content.push(consumeExpression(reader))
		} else {
			const position = reader.getPosition()
			const word = consumeWord(reader)
			content.push({
				type: "interpolation-variable",
				name: word,
				position,
			})
		}

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
		position: reader.getPosition(e),
	}
}
