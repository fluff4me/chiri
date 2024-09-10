import type { ChiriLiteralValue, ChiriType } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"

export default (reader: ChiriReader, type: ChiriType): ChiriLiteralValue | undefined => {
	const result = reader.getType(type.name.value)
		.consumeOptionalConstructor?.(reader)
	if (!result)
		return undefined

	if ("type" in result && result.type === "literal")
		return result as ChiriLiteralValue

	throw reader.error(`Invalid result from ${type.name.value} constructor`)
	// return {
	// 	type: "literal",
	// 	subType: "other",
	// 	valueType: type.name.value,
	// 	value: result,
	// };
}
