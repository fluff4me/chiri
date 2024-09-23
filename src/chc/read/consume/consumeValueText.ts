import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import { ChiriType } from "../ChiriType"
import consumeExpression, { type ChiriExpressionOperand } from "./consumeExpression"
import consumeNewBlockLineOptional from "./consumeNewBlockLineOptional"
import type { ChiriWord } from "./consumeWord"
import consumeWordInterpolated from "./consumeWordInterpolated"
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional"

export interface ChiriInterpolationVariable {
	type: "interpolation-variable"
	name: ChiriWord
	position: ChiriPosition
}

export interface ChiriInterpolationProperty {
	type: "interpolation-property"
	name: ChiriWordInterpolated
	position: ChiriPosition
}

export interface ChiriTextRaw {
	type: "text-raw"
	text: string
	position: ChiriPosition
}

export interface ChiriValueText {
	type: "text"
	valueType: ChiriType
	content: (ChiriTextRaw | ChiriInterpolationVariable | ChiriInterpolationProperty | ChiriExpressionOperand | string)[]
	position: ChiriPosition
}

export default (reader: ChiriReader, multiline: boolean): ChiriValueText => {
	const e = reader.i
	const start = reader.getPosition()

	const content: ChiriValueText["content"] = []

	let textStart = start
	let text = ""
	for (; reader.i < reader.input.length; reader.i++) {
		if (reader.input[reader.i] === "\n") {
			if (!multiline || !consumeNewBlockLineOptional(reader))
				break

			text += " "
			continue
		}

		if (reader.input[reader.i] === "\r")
			continue

		const varType = reader.consumeOptional("#{", "$")
		if (!varType) {
			text += reader.input[reader.i]
			continue
		}

		if (text) {
			content.push({
				type: "text-raw",
				position: textStart,
				text,
			})
		}

		if (varType === "$") {
			const property = consumeWordInterpolated(reader)
			content.push({
				type: "interpolation-property",
				name: property,
				position: property.position,
			})

		} else {
			content.push(consumeExpression(reader))
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
		position: start,
	}
}
