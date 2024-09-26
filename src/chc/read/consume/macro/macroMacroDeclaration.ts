

import type { ChiriMacroBase } from "./MacroFunction"
import MacroFunction from "./MacroFunction"

export interface ChiriMacro extends ChiriMacroBase {
	type: "macro"
}

export default MacroFunction("macro")
	.named()
	.body("inherit")
	.consume(({ body, name, position }): ChiriMacro | undefined => ({
		type: "macro",
		name,
		content: body,
		position,
	}))
