import type { ChiriPosition } from "../../ChiriReader"
import consumeWhiteSpace from "../consumeWhiteSpace"
import type { ChiriExpressionOperand } from "../expression/consumeExpression"
import consumeExpression from "../expression/consumeExpression"
import MacroConstruct from "./MacroConstruct"

export interface ChiriReturn {
	type: "return"
	expression: ChiriExpressionOperand
	position: ChiriPosition
}

export default MacroConstruct("return")
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
