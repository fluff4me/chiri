

import type ChiriReader from "../ChiriReader"
import type { ChiriTypeGeneric } from "../ChiriType"
import { ChiriType } from "../ChiriType"
import consumeTypeNameOptional from "./consumeTypeNameOptional"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"

export function consumeType (reader: ChiriReader): ChiriType
export function consumeType (reader: ChiriReader, genericDeclaration: true): ChiriTypeGeneric
export function consumeType (reader: ChiriReader, genericDeclaration?: true) {
	const e = reader.i
	const type = consumeTypeOptional(reader, genericDeclaration!)
	if (!type)
		throw reader.error(e, "Expected type")
	return type
}

export function consumeTypeOptional (reader: ChiriReader): ChiriType | undefined
export function consumeTypeOptional (reader: ChiriReader, genericDeclaration: true): ChiriTypeGeneric | undefined
export function consumeTypeOptional (reader: ChiriReader, genericDeclaration?: true): ChiriType | undefined {
	const typeName = consumeTypeNameOptional(reader, genericDeclaration)
	if (!typeName)
		return undefined

	const type: ChiriType = {
		type: "type",
		name: typeName,
		generics: [],
	}

	if (typeName.value === "*")
		return type

	const definition = reader.getTypeOptional(typeName.value)
	if (definition?.type.isGeneric)
		return definition.type // use exact generic types as defined

	if (definition?.generics)
		type.generics = consumeGenerics(reader, definition.generics === true ? undefined : definition.generics)
	else if (genericDeclaration)
		type.generics = consumeGenerics(reader, undefined, true)

	if (genericDeclaration)
		type.isGeneric = true

	return type
}

const consumeGenerics = (reader: ChiriReader, generics?: number | string[][], genericDeclaration = false) => {
	const result: ChiriType[] = []
	if (typeof generics === "number") {
		for (let g = 0; g < generics; g++) {
			reader.consume("!")
			result.push(consumeType(reader))
		}

	} else if (generics) {
		for (const generic of generics) {
			reader.consume("!")
			const parenthesised = reader.consumeOptional("(")
			result.push(ChiriType.of(reader.consume(...generic)))
			if (parenthesised) reader.consume(")")
		}

	} else {
		while (true) {
			if (!reader.consumeOptional("!"))
				break

			const parenthesised = reader.consumeOptional("(")

			while (genericDeclaration) {
				if (result.length)
					if (!consumeWhiteSpaceOptional(reader))
						break

				const type = consumeTypeOptional(reader)
				if (!type)
					break

				result.push(type)
			}

			if (parenthesised) reader.consume(")")
		}

		if (!result.length)
			throw reader.error("Expected type generic")
	}

	return result
}
