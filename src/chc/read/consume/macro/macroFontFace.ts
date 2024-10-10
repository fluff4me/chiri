import typeString from "../../../type/typeString"
import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import type { ChiriExpressionOperand } from "../expression/consumeExpression"
import MacroConstruct from "./MacroConstruct"

export interface ChiriFontFace {
	type: "font-face"
	family: ChiriExpressionOperand
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("font-face")
	.parameter("family", typeString.type)
	.body("mixin")
	.consume(({ assignments, body, position }): ChiriFontFace | undefined => {
		return {
			type: "font-face",
			family: assignments.family,
			content: body,
			position,
		}
	})
