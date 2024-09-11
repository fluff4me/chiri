import type { ChiriExpressionOperand, ChiriStatement, ChiriText } from "../../../ChiriAST"
import { ChiriType } from "../../ChiriType"
import MacroFunction from "./MacroFunctionInternal"

export interface ChiriShorthand {
	type: "shorthand"
	property: ChiriText | ChiriExpressionOperand
	body: ChiriStatement[]
}

export default MacroFunction("shorthand")
	.parameter("of", ChiriType.of("string"))
	.body()
	.consume(({ reader, assignments, body }): ChiriShorthand => ({
		type: "shorthand",
		property: assignments.of,
		body,
	}))
