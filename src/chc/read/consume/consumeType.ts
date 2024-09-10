

import type { ChiriType } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import consumeTypeNameOptional from "./consumeTypeNameOptional"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"

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
	if (definition.hasGenerics) {
		consumeWhiteSpaceOptional(reader)
		type.generics = consumeGenerics(reader, definition.hasGenerics === true ? undefined : definition.hasGenerics)
	}

	return type
}

const consumeGenerics = (reader: ChiriReader, quantity?: number) => {
	const generics = []
	if (quantity)
		for (let g = 0; g < quantity; g++)
			generics.push(consumeType(reader))
	else
		while (true) {
			const type = consumeTypeOptional(reader)
			if (type)
				generics.push(type)
			else break
		}
	return generics
}
