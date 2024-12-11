import { ChiriType } from "../../../type/ChiriType"
import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import consumeWhiteSpace from "../consumeWhiteSpace"
import type { ChiriExpressionOperand } from "../expression/consumeExpression"
import consumeExpression from "../expression/consumeExpression"
import type { ChiriMacroBlock } from "./MacroConstruct"
import MacroConstruct from "./MacroConstruct"

export interface ChiriWhile extends ChiriMacroBlock {
	type: "while"
	condition: ChiriExpressionOperand
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("while")
	.consumeParameters(reader => consumeWhiteSpace(reader) && consumeExpression.inline(reader, ChiriType.of("bool")))
	.body("inherit")
	.consume(({ extra: condition, body: content, position }): ChiriWhile => {
		return {
			type: "while",
			isBlock: true,
			condition,
			content,
			position,
		}
	})
