import { INTERNAL_POSITION } from "../../../constants"
import { ChiriType } from "../../type/ChiriType"
import type { ChiriLiteralNumeric } from "../consume/numeric/Numeric"

export default (int: string | number, position = INTERNAL_POSITION): ChiriLiteralNumeric => ({
	type: "literal",
	subType: "int",
	valueType: ChiriType.of("int"),
	value: `${int}`,
	position,
})
