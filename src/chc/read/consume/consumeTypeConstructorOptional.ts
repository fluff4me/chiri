import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import type { ChiriType } from "../ChiriType"
import type { ChiriTypeDefinition } from "../ChiriTypeManager"
import type { ChiriLiteralList } from "../type/typeList"
import type { ChiriLiteralString } from "./consumeStringOptional"
import type { ChiriLiteralNumeric } from "./numeric/Numeric"

export interface ChiriLiteralBool {
	type: "literal"
	subType: "bool"
	valueType: ChiriType
	value: boolean
	position: ChiriPosition
}
export interface ChiriLiteralUndefined {
	type: "literal"
	subType: "undefined"
	valueType: ChiriType
	position: ChiriPosition
	value?: undefined
}

export type ChiriLiteralValue = ChiriLiteralString | ChiriLiteralNumeric | ChiriLiteralBool | ChiriLiteralUndefined | ChiriLiteralList

export default (reader: ChiriReader, type?: ChiriType): ChiriLiteralValue | undefined => {
	if (type !== undefined)
		return consumeTypeConstructorOptional(reader, type.name.value, reader.getType(type.name.value))

	for (const [typename, type] of Object.entries(reader.types.types)) {
		const result = consumeTypeConstructorOptional(reader, typename, type)
		if (result) return result
	}

	// return {
	// 	type: "literal",
	// 	subType: "other",
	// 	valueType: type.name.value,
	// 	value: result,
	// };
}

function consumeTypeConstructorOptional (reader: ChiriReader, typename: string, type: ChiriTypeDefinition) {
	const result = type.consumeOptionalConstructor?.(reader)
	if (!result)
		return undefined

	if ("type" in result && result.type === "literal")
		return result as ChiriLiteralValue

	throw reader.error(`Invalid result from ${typename} constructor`)
}
