

import type ChiriReader from "../ChiriReader"
import type { ChiriPositionState } from "../ChiriReader"
import type { ChiriType } from "../ChiriType"
import consumeTypeNameOptional from "./consumeTypeNameOptional"

export const consumeType = (reader: ChiriReader) => {
	const e = reader.i
	const type = consumeTypeOptional(reader)
	if (!type)
		throw reader.error(e, "Expected type")
	return type
}

export const consumeTypeOptional = (reader: ChiriReader): ChiriType | undefined => {
	const e = reader.i
	const typeName = consumeTypeNameOptional(reader)
	if (!typeName)
		return undefined

	const type: ChiriType = {
		type: "type",
		name: typeName,
		generics: [],
	}

	if (typeName.value === "*")
		return type

	const definition = reader.getType(typeName.value)
	if (definition.hasGenerics)
		type.generics = consumeGenerics(reader, definition.hasGenerics === true ? undefined : definition.hasGenerics)

	return type
}

const consumeGenerics = (reader: ChiriReader, quantity?: number) => {
	const generics = []
	if (quantity) {
		for (let g = 0; g < quantity; g++) {
			reader.consume("!")
			generics.push(consumeType(reader))
		}

	} else {
		let savedPosition: ChiriPositionState | undefined
		while (true) {
			savedPosition = reader.savePosition()
			if (!reader.consumeOptional("!"))
				break

			const type = consumeTypeOptional(reader)
			if (!type) {
				if (savedPosition) reader.restorePosition(savedPosition)
				break
			}

			generics.push(type)
		}
	}

	return generics
}
