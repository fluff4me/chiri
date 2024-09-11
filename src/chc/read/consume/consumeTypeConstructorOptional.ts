import type { ChiriLiteralValue } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import type { ChiriType } from "../ChiriType"
import type { ChiriTypeDefinition } from "../ChiriTypeManager"

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
