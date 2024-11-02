import typeString from "../../../type/typeString"
import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import type { ChiriExpressionOperand } from "../expression/consumeExpression"
import MacroConstruct from "./MacroConstruct"

export interface ChiriSelect {
	type: "select"
	selector: ChiriExpressionOperand
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("select")
	.parameter("where", typeString.type)
	.body("mixin")
	.consume(({ reader, position, assignments, body }): ChiriSelect => {
		return {
			type: "select",
			selector: assignments.where,
			content: body,
			position,
		}
	})
