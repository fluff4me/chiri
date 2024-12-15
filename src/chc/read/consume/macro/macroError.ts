import typeBool from "../../../type/typeBool"
import makeLiteralBool from "../../factory/makeLiteralBool"
import type { ChiriMacroUse } from "../consumeMacroUseOptional"
import MacroConstruct from "./MacroConstruct"

export default MacroConstruct("error")
	.body("text")
	.parameter("function", typeBool.type, makeLiteralBool(false))
	.parameter("macro", typeBool.type, makeLiteralBool(false))
	.consume(({ reader, assignments, body, position }): ChiriMacroUse => ({
		type: "macro-use",
		name: { type: "word", value: "error", position: { file: "internal", line: 0, column: 0 } },
		assignments,
		content: body,
		position,
	}))
