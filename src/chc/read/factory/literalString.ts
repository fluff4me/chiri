import { INTERNAL_POSITION } from "../../../constants"
import { ChiriType } from "../../type/ChiriType"
import type { ChiriLiteralString } from "../consume/consumeStringOptional"

export default (string: string | ChiriLiteralString["segments"], position = INTERNAL_POSITION): ChiriLiteralString => ({
	type: "literal",
	subType: "string",
	valueType: ChiriType.of("string"),
	segments: typeof string === "string" ? [string] : string,
	position,
})
