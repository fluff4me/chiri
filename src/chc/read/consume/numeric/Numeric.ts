import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriType } from "../../ChiriType"

export interface ChiriLiteralNumeric {
	type: "literal"
	subType: "uint" | "int" | "dec"
	value: string
	valueType: ChiriType
	position: ChiriPosition
}
