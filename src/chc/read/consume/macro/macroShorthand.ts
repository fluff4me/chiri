import type { ChiriPosition } from "../../ChiriReader"
import { ChiriType } from "../../ChiriType"
import type { ChiriExpressionOperand } from "../consumeExpression"
import type { MacroResult } from "../consumeMacroUseOptional"
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional"
import MacroFunction from "./MacroFunction"
import type { ChiriImport } from "./macroImport"

export interface ChiriShorthand {
	type: "shorthand"
	property: ChiriWordInterpolated | ChiriExpressionOperand
	body: MacroResultShorthand[]
	position: ChiriPosition
}

export type MacroResultShorthand = Exclude<MacroResult, ChiriImport> | ChiriWordInterpolated

export default MacroFunction("shorthand")
	.parameter("of", ChiriType.of("string"))
	.body("shorthand")
	.consume(({ reader, assignments, body, position }): ChiriShorthand => ({
		type: "shorthand",
		property: assignments.of,
		body: body as MacroResultShorthand[],
		position,
	}))
