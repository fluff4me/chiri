import type { ChiriFunctionUse } from "../consumeFunctionUseOptional"
import MacroFunction from "./MacroFunction"

export default MacroFunction("debug")
	.body("text")
	.consume(({ reader, assignments, body, position }): ChiriFunctionUse => ({
		type: "function-use",
		name: { type: "word", value: "debug", position: { file: "internal", line: 0, column: 0 } },
		assignments: {},
		content: body,
		position,
	}))
