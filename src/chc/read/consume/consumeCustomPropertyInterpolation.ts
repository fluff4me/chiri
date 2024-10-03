import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import type { ChiriValueText, default as consumeValueTextType } from "./consumeValueText"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"
import consumeWordInterpolated from "./consumeWordInterpolated"
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional"

export interface ChiriInterpolationProperty {
	type: "interpolation-property"
	name: ChiriWordInterpolated
	defaultValue?: ChiriValueText
	position: ChiriPosition
}

export interface ChiriInterpolationPropertyName {
	type: "interpolation-property-name"
	name: ChiriWordInterpolated
	position: ChiriPosition
}

function consumeCustomPropertyInterpolation (reader: ChiriReader, varType: "$" | "$$"): ChiriInterpolationProperty | ChiriInterpolationPropertyName {
	const wrapped = reader.consumeOptional("{")
	const property = consumeWordInterpolated(reader)
	let defaultValue: ChiriValueText | undefined

	if (wrapped) {
		if (varType !== "$$" && reader.consumeOptional(":")) {
			consumeWhiteSpaceOptional(reader)
			defaultValue = consumeCustomPropertyInterpolation.consumeValueText(reader, false, () => !!reader.peek("}"))
		}

		reader.consume("}")
	}

	if (varType === "$$") {
		return {
			type: "interpolation-property-name",
			name: property,
			position: property.position,
		}

	} else {
		return {
			type: "interpolation-property",
			name: property,
			defaultValue,
			position: property.position,
		}
	}
}

namespace consumeCustomPropertyInterpolation {
	export let consumeValueText: typeof consumeValueTextType
}

export default consumeCustomPropertyInterpolation
