import { INTERNAL_POSITION } from "../../../constants"
import { ChiriType } from "../../type/ChiriType"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import consumeBlockStartOptional from "./consumeBlockStartOptional"
import type { ChiriValueText } from "./consumeValueText"
import consumeValueText from "./consumeValueText"
import consumeWhiteSpace from "./consumeWhiteSpace"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"
import type { ChiriWord } from "./consumeWord"
import consumeWord from "./consumeWord"
import consumeWordInterpolated from "./consumeWordInterpolated"
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional"

export interface ChiriProperty {
	type: "property"
	isCustomProperty?: true
	property: ChiriWordInterpolated
	value: ChiriValueText
	position: ChiriPosition
}

export interface ChiriPropertyDefinition {
	type: "property-definition"
	syntax: ChiriWord
	property: ChiriWordInterpolated
	value: ChiriValueText
	position: ChiriPosition
}

interface CustomPropertyDefinitionType {
	syntax: string
	initialValue?: string
}

const customPropertyDefinitionTypes = {
	color: {
		syntax: "<color>",
		initialValue: "#000",
	},
	colour: {
		syntax: "<color>",
		initialValue: "#000",
	},
} satisfies Record<string, CustomPropertyDefinitionType>

const typeNames = Object.keys(customPropertyDefinitionTypes) as (keyof typeof customPropertyDefinitionTypes)[]

export default (reader: ChiriReader): ChiriProperty | ChiriPropertyDefinition | undefined => {
	const e = reader.i
	if (!reader.isLetter() && reader.input[reader.i] !== "$" && reader.input[reader.i] !== "#")
		return undefined

	if (reader.input[reader.i] === "#" && reader.input[reader.i + 1] !== "{")
		return undefined

	const position = reader.getPosition()
	const isCustomProperty = reader.consumeOptional("$")

	const isCustomPropertyDefinition = isCustomProperty && reader.consumeOptional("$")
	if (isCustomPropertyDefinition && reader.context.type !== "root")
		throw reader.error("Custom property definitions must be in the root context")

	const property = consumeWordInterpolated(reader)

	const typeWord = !isCustomPropertyDefinition ? undefined
		: reader.consume("!") && consumeWord(reader, ...typeNames)

	const type = !typeWord ? undefined : customPropertyDefinitionTypes[typeWord.value]

	let consumeValue: boolean
	if (!isCustomPropertyDefinition || type?.initialValue === undefined)
		consumeValue = reader.consume(":") && consumeWhiteSpace(reader)
	else
		consumeValue = !!reader.consumeOptional(":") && (consumeWhiteSpaceOptional(reader) || true)

	const value: ChiriValueText = consumeValue ? consumeValueText(reader, !!consumeBlockStartOptional(reader))
		: {
			type: "text",
			content: [type!.initialValue],
			position: INTERNAL_POSITION,
			valueType: ChiriType.of("string"),
		}

	if (type)
		return {
			type: "property-definition",
			property,
			syntax: {
				type: "word",
				value: type.syntax,
				position: typeWord!.position,
			},
			value,
			position,
		}

	return {
		type: "property",
		isCustomProperty: isCustomProperty ? true : undefined,
		position,
		property,
		value,
	}
}
