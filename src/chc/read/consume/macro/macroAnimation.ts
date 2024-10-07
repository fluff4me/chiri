import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional"
import MacroConstruct from "./MacroConstruct"

export interface ChiriAnimation {
	type: "animation"
	name: ChiriWordInterpolated
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("animation")
	.named(true)
	.body("keyframes")
	.consume(({ name, body, position }): ChiriAnimation => {
		return {
			type: "animation",
			name,
			content: body,
			position,
		}
	})
