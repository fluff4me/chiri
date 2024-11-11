import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import MacroConstruct from "./MacroConstruct"

export interface ChiriAfter {
	type: "after"
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("after")
	.body("selectors")
	.consume(({ body, position }): ChiriAfter => {
		return {
			type: "after",
			content: body.flat(),
			position,
		}
	})
