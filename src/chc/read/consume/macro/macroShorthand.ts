import type { ChiriExpressionOperand, ChiriImport, ChiriText } from "../../../ChiriAST"
import { ChiriType } from "../../ChiriType"
import bodyMacros from "../body/bodyMacros"
import bodyShorthand from "../body/bodyShorthand"
import type { MacroResult } from "../consumeMacroUseOptional"
import MacroFunction from "./MacroFunction"

export interface ChiriShorthand {
	type: "shorthand"
	property: ChiriText | ChiriExpressionOperand
	body: MacroResultShorthand[]
}

export type MacroResultShorthand = Exclude<MacroResult, ChiriImport> | ChiriText

export default MacroFunction("shorthand")
	.parameter("of", ChiriType.of("string"))
	.body(async reader => bodyShorthand(reader) ?? await bodyMacros(reader, "shorthand"))
	.consume(({ reader, assignments, body }): ChiriShorthand => ({
		type: "shorthand",
		property: assignments.of,
		body: body as MacroResultShorthand[],
	}))
