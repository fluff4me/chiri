import path from "path"
import type { ChiriPosition } from "./chc/read/ChiriReader"
import { ChiriType } from "./chc/read/ChiriType"
import type { ChiriLiteralString } from "./chc/read/consume/consumeStringOptional"
import type { ChiriLiteralBool } from "./chc/read/consume/consumeTypeConstructorOptional"

export const PACKAGE_ROOT = path.dirname(__dirname)
export const LIB_ROOT = path.join(PACKAGE_ROOT, "lib")
export const CHC_ROOT = path.join(__dirname, "chc")

export const INTERNAL_POSITION: ChiriPosition = { file: "internal", line: 0, column: 0 }

export const LITERAL_TRUE: ChiriLiteralBool = { type: "literal", subType: "bool", value: true, valueType: ChiriType.of("bool"), position: INTERNAL_POSITION }
export const LITERAL_FALSE: ChiriLiteralBool = { type: "literal", subType: "bool", value: false, valueType: ChiriType.of("bool"), position: INTERNAL_POSITION }
export const LITERAL_STRING_ROOT: ChiriLiteralString = { type: "literal", subType: "string", segments: ["root"], valueType: ChiriType.of("string") }
