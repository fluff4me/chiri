import type { ChiriPosition } from "../../ChiriReader"
import consumeWhiteSpace from "../consumeWhiteSpace"
import type { ChiriExpressionResult } from "../expression/consumeExpression"
import consumeExpression from "../expression/consumeExpression"
import MacroConstruct from "./MacroConstruct"

export interface ChiriReturn {
	type: "return"
	expression: ChiriExpressionResult
	position: ChiriPosition
}

export default MacroConstruct("return")
	.consume(async ({ reader, position }): Promise<ChiriReturn> => {
		consumeWhiteSpace(reader)

		if (reader.context.type !== "function")
			throw reader.error("#return cannot be used in this context")

		const expression = await consumeExpression(reader, ...reader.context.data.types)

		return {
			type: "return",
			expression,
			position,
		}
	})
