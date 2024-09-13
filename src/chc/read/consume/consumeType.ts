

import type ChiriReader from "../ChiriReader"
import type { ChiriPositionState } from "../ChiriReader"
import { ChiriType } from "../ChiriType"
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
	if (definition.generics)
		type.generics = consumeGenerics(reader, definition.generics === true ? undefined : definition.generics)

	return type
}

const consumeGenerics = (reader: ChiriReader, generics?: number | string[][]) => {
	const result: ChiriType[] = []
	if (typeof generics === "number") {
		for (let g = 0; g < generics; g++) {
			reader.consume("!")
			result.push(consumeType(reader))
		}

	} else if (generics) {
		for (const generic of generics) {
			reader.consume("!")
			result.push(ChiriType.of(reader.consume(...generic)))
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

			result.push(type)
		}
	}

	return result
}
