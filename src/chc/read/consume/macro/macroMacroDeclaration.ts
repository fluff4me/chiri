

import type { ChiriMacroBase } from "./MacroConstruct"
import MacroConstruct from "./MacroConstruct"

export interface ChiriMacro extends ChiriMacroBase {
	type: "macro"
}

export default MacroConstruct("macro")
	.named()
	.body("inherit")
	.consume(({ body, name, position }): ChiriMacro | undefined => ({
		type: "macro",
		name,
		content: body,
		position,
	}))
