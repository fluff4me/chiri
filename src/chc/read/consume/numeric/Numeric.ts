import type { ChiriType } from "../../../type/ChiriType"
import type { ChiriPosition } from "../../ChiriReader"

export interface ChiriLiteralNumeric {
	type: "literal"
	subType: "uint" | "int" | "dec"
	value: string
	valueType: ChiriType
	position: ChiriPosition
}
