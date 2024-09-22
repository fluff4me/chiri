

import type { ChiriFunction } from "../../../ChiriAST"
import MacroFunction from "./MacroFunction"

export default MacroFunction("function")
	.named()
	.body("inherit")
	.consume(({ reader, assignments, body, name }): ChiriFunction | undefined => ({
		type: "function",
		name,
		content: body,
	}))
