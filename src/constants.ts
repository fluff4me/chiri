import path from "path"
import type { ChiriLiteralBool, ChiriPosition } from "./chc/ChiriAST"
import { ChiriType } from "./chc/read/ChiriType"

export const PACKAGE_ROOT = path.dirname(__dirname)
export const LIB_ROOT = path.join(PACKAGE_ROOT, "lib")
export const CHC_ROOT = path.join(__dirname, "chc")

export const INTERNAL_POSITION: ChiriPosition = { file: "internal", line: 0, column: 0 }

export const LITERAL_TRUE: ChiriLiteralBool = { type: "literal", subType: "bool", value: true, valueType: ChiriType.of("bool"), position: INTERNAL_POSITION }
export const LITERAL_FALSE: ChiriLiteralBool = { type: "literal", subType: "bool", value: false, valueType: ChiriType.of("bool"), position: INTERNAL_POSITION }
