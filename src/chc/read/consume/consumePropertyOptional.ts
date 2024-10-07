import { INTERNAL_POSITION } from "../../../constants"
import { ChiriType } from "../../type/ChiriType"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import consumeBody from "./consumeBody"
import type { MacroResult } from "./consumeMacroUseOptional"
import type { ChiriValueText } from "./consumeValueText"
import type { ChiriWord } from "./consumeWord"
import consumeWord from "./consumeWord"
import consumeWordInterpolated from "./consumeWordInterpolated"
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional"

export interface ChiriProperty {
	type: "property"
	isCustomProperty?: true
	property: ChiriWordInterpolated
	value: (ChiriValueText | MacroResult)[]
	position: ChiriPosition
}

export interface ChiriPropertyDefinition {
	type: "property-definition"
	syntax: ChiriWord
	property: ChiriWordInterpolated
	value: (ChiriValueText | MacroResult)[]
	position: ChiriPosition
}

interface CustomPropertyDefinitionType {
	syntax: string
	initialValue?: string
}

// https://developer.mozilla.org/en-US/docs/Web/CSS/@property
const customPropertyDefinitionTypes = {
	number: {
		syntax: "<number>",
		initialValue: "0",
	},
	dec: {
		syntax: "<number>",
		initialValue: "0",
	},
	int: {
		syntax: "<integer>",
		initialValue: "0",
	},
	time: {
		syntax: "<time>",
		initialValue: "0s",
	},
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

export default async (reader: ChiriReader): Promise<ChiriProperty | ChiriPropertyDefinition | undefined> => {
	const e = reader.i
	if (!reader.isLetter() && reader.input[reader.i] !== "$" && reader.input[reader.i] !== "#" && reader.input[reader.i] !== "-")
		return undefined

	if (reader.input[reader.i] === "#" && reader.input[reader.i + 1] !== "{")
		return undefined

	const position = reader.getPosition()
	const isCustomProperty = reader.consumeOptional("$")

	const isCustomPropertyDefinition = isCustomProperty && reader.consumeOptional("$")
	if (isCustomPropertyDefinition && reader.context.type !== "root")
		throw reader.error("Custom property definitions must be in the root context")

	const property = consumeWordInterpolated(reader, true)

	const typeWord = !isCustomPropertyDefinition ? undefined
		: reader.consume("!") && consumeWord(reader, ...typeNames)

	const type = !typeWord ? undefined : customPropertyDefinitionTypes[typeWord.value]

	let consumeValue: boolean
	if (!isCustomPropertyDefinition || type?.initialValue === undefined)
		consumeValue = !!reader.consume(":")
	else
		consumeValue = !!reader.consumeOptional(":")

	let value: (ChiriValueText | MacroResult)[]
	if (!consumeValue) {
		value = [{
			type: "text",
			content: [type!.initialValue],
			position: INTERNAL_POSITION,
			valueType: ChiriType.of("string"),
		}]

	} else {
		const position = reader.getPosition()
		const textBody = await consumeBody(reader, "text")
		value = textBody.content
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
