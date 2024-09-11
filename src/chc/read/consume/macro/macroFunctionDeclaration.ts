

import type { ChiriFunction } from "../../../ChiriAST"
import MacroFunction from "./MacroFunctionInternal"

export default MacroFunction("function")
	.named()
	.body()
	.consume(({ reader, assignments, body, name }): ChiriFunction | undefined => ({
		type: "function",
		name,
		content: body,
	}))
