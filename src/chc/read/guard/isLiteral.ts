import type { ChiriLiteralBool, ChiriLiteralNumeric, ChiriLiteralString, ChiriLiteralUndefined, ChiriLiteralValue } from "../../ChiriAST"
import type { ChiriLiteralList } from "../type/typeList"

export default function (value: unknown, subType?: "string"): value is ChiriLiteralString
export default function (value: unknown, subType?: "uint" | "int" | "dec"): value is ChiriLiteralNumeric
export default function (value: unknown, subType?: "bool"): value is ChiriLiteralBool
export default function (value: unknown, subType?: "undefined"): value is ChiriLiteralUndefined
export default function (value: unknown, subType?: "list"): value is ChiriLiteralList
export default function (value: unknown, subType?: ChiriLiteralValue["subType"]): value is ChiriLiteralValue {
	return typeof value === "object" && !!value && (value as ChiriLiteralValue).type === "literal"
}
