

import type { ChiriType } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import consumeTypeConstructorOptional from "./consumeTypeConstructorOptional"

export default (reader: ChiriReader, type: ChiriType) => {
	const e = reader.i
	const result = consumeTypeConstructorOptional(reader, type)
	if (result === undefined)
		throw reader.error(e, `Expected '${type.name.value}' constructor`)

	return result
}
