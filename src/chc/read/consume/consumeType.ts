

import type { ChiriTypeGeneric } from "../../type/ChiriType"
import { ChiriType } from "../../type/ChiriType"
import type ChiriReader from "../ChiriReader"
import consumeTypeNameOptional from "./consumeTypeNameOptional"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"
import consumeWordOptional from "./consumeWordOptional"

export function consumeType (reader: ChiriReader): ChiriType
export function consumeType (reader: ChiriReader, genericDeclaration: true): ChiriTypeGeneric
export function consumeType (reader: ChiriReader, genericDeclaration?: true) {
	const e = reader.i
	const type = consumeTypeOptional(reader, genericDeclaration!)
	if (!type)
		throw reader.error(e, "Expected type")
	return type
}

export function consumeTypeOptional (reader: ChiriReader, genericDeclaration?: false, throwOnInvalidName?: true): ChiriType | undefined
export function consumeTypeOptional (reader: ChiriReader, genericDeclaration: true, throwOnInvalidName?: true): ChiriTypeGeneric | undefined
export function consumeTypeOptional (reader: ChiriReader, genericDeclaration?: boolean, throwOnInvalidName?: true): ChiriType | undefined {
	const typeName = consumeTypeNameOptional(reader, genericDeclaration, throwOnInvalidName)
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
		type.generics = consumeGenerics(reader, undefined)

	if (genericDeclaration)
		type.isGeneric = true

	return type
}

const consumeGenerics = (reader: ChiriReader, generics?: number | string[][]) => {
	const result: ChiriType[] = []
	if (typeof generics === "number") {
		for (let g = 0; g < generics; g++) {
			reader.consume("!")
			const anyType = consumeWordOptional(reader, "*")
			if (anyType)
				result.push({
					type: "type",
					name: anyType,
					generics: [],
				})
			else
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

			while (true) {
				if (result.length)
					if (!consumeWhiteSpaceOptional(reader))
						break

				if (!parenthesised) {
					const anyType = consumeWordOptional(reader, "*")
					if (anyType) {
						result.push({
							type: "type",
							name: anyType,
							generics: [],
						})
						break
					}
				}

				const type = consumeTypeOptional(reader, undefined, true)
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
