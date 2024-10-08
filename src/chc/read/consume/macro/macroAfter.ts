import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional"
import MacroConstruct from "./MacroConstruct"

export interface ChiriAfter {
	type: "after"
	content: ChiriWordInterpolated[]
	position: ChiriPosition
}

export default MacroConstruct("after")
	.body("selectors")
	.consume(({ body, position }): ChiriAfter => {
		return {
			type: "after",
			content: body,
			position,
		}
	})
