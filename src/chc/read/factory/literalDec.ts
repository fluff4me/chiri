import { INTERNAL_POSITION } from "../../../constants"
import { ChiriType } from "../../type/ChiriType"
import type { ChiriLiteralNumeric } from "../consume/numeric/Numeric"

export default (dec: string | number, position = INTERNAL_POSITION): ChiriLiteralNumeric => ({
	type: "literal",
	subType: "dec",
	valueType: ChiriType.of("dec"),
	value: `${dec}`,
	position,
})
