

import type { ChiriFunctionBase } from "./MacroFunction"
import MacroFunction from "./MacroFunction"

export interface ChiriFunction extends ChiriFunctionBase {
	type: "function"
}

export default MacroFunction("function")
	.named()
	.body("inherit")
	.consume(({ reader, assignments, body, name }): ChiriFunction | undefined => ({
		type: "function",
		name,
		content: body,
	}))
