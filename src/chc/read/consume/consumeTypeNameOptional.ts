

import type ChiriReader from "../ChiriReader"
import consumeWordOptional from "./consumeWordOptional"

export default (reader: ChiriReader, genericDeclaration = false, throwOnInvalidName?: true) => {
	const e = reader.i
	const type = consumeWordOptional(reader)
	if (!type)
		return undefined

	const typeExists = !!reader.getTypeOptional(type.value)
	if (typeExists && genericDeclaration)
		throw reader.error(`Cannot declare type "${type.value}", a type already exists with that name`)

	if (!genericDeclaration && !typeExists) {
		if (throwOnInvalidName)
			throw reader.error(e, `Unknown type "${type.value}"`)

		return undefined
	}

	return type
}
