import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriExpressionOperand } from "../consumeExpression"
import consumeExpression from "../consumeExpression"
import consumeWhiteSpace from "../consumeWhiteSpace"
import MacroFunction from "./MacroFunction"

export interface ChiriReturn {
	type: "return"
	expression: ChiriExpressionOperand
	position: ChiriPosition
}

export default MacroFunction("return")
	.consume(({ reader, position }): ChiriReturn => {
		consumeWhiteSpace(reader)
		consumeExpression(reader)

		if (reader.context.type !== "function")
			throw reader.error("#return cannot be used in this context")

		const expression = consumeExpression(reader, ...reader.context.data.types)

		return {
			type: "return",
			expression,
			position,
		}
	})
