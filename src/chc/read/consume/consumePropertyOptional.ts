import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import consumeBlockStartOptional from "./consumeBlockStartOptional"
import type { ChiriValueText } from "./consumeValueText"
import consumeValueText from "./consumeValueText"
import consumeWhiteSpace from "./consumeWhiteSpace"
import consumeWordInterpolated from "./consumeWordInterpolated"
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional"

export interface ChiriProperty {
	type: "property"
	isCustomProperty?: true
	property: ChiriWordInterpolated
	value: ChiriValueText
	position: ChiriPosition
}

export default (reader: ChiriReader): ChiriProperty | undefined => {
	const e = reader.i
	if (!reader.isLetter() && reader.input[reader.i] !== "$" && reader.input[reader.i] !== "#")
		return undefined

	if (reader.input[reader.i] === "#" && reader.input[reader.i + 1] !== "{")
		return undefined

	const position = reader.getPosition()
	const isCustomProperty = reader.consumeOptional("$")

	const property = consumeWordInterpolated(reader)

	reader.consume(":")
	consumeWhiteSpace(reader)

	const value = consumeValueText(reader, !!consumeBlockStartOptional(reader))

	return {
		type: "property",
		isCustomProperty: isCustomProperty ? true : undefined,
		position,
		property,
		value,
	}
}
