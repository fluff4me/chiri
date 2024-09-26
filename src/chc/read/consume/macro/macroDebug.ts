import type { ChiriMacroUse } from "../consumeMacroUseOptional"
import MacroConstruct from "./MacroConstruct"

export default MacroConstruct("debug")
	.body("text")
	.consume(({ reader, assignments, body, position }): ChiriMacroUse => ({
		type: "macro-use",
		name: { type: "word", value: "debug", position: { file: "internal", line: 0, column: 0 } },
		assignments: {},
		content: body,
		position,
	}))
