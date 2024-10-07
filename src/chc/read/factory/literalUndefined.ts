import { INTERNAL_POSITION } from "../../../constants"
import { ChiriType } from "../../type/ChiriType"
import type { ChiriLiteralUndefined } from "../consume/consumeTypeConstructorOptional"

export default (position = INTERNAL_POSITION): ChiriLiteralUndefined => ({
	type: "literal",
	subType: "undefined",
	valueType: ChiriType.of("undefined"),
	position,
})
