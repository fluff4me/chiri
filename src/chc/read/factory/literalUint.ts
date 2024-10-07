import { INTERNAL_POSITION } from "../../../constants"
import { ChiriType } from "../../type/ChiriType"
import type { ChiriLiteralNumeric } from "../consume/numeric/Numeric"

export default (uint: string | number, position = INTERNAL_POSITION): ChiriLiteralNumeric => ({
	type: "literal",
	subType: "uint",
	valueType: ChiriType.of("uint"),
	value: `${uint}`,
	position,
})
