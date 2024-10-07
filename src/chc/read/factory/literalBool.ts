import { INTERNAL_POSITION } from "../../../constants"
import { ChiriType } from "../../type/ChiriType"
import type { ChiriLiteralBool } from "../consume/consumeTypeConstructorOptional"

export default (bool: boolean, position = INTERNAL_POSITION): ChiriLiteralBool => ({
	type: "literal",
	subType: "bool",
	valueType: ChiriType.of("bool"),
	value: bool,
	position,
})
