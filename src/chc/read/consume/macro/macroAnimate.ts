import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import type { ChiriValueText } from "../consumeValueText"
import consumeValueText from "../consumeValueText"
import consumeWhiteSpace from "../consumeWhiteSpace"
import MacroConstruct from "./MacroConstruct"

export interface ChiriAnimate {
	type: "animate"
	shorthand: ChiriValueText
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("animate")
	.consumeParameters(reader => consumeWhiteSpace(reader) && consumeValueText(reader, false, () => !!reader.peek(":")))
	.body("keyframes")
	.consume(({ extra: shorthand, body, position }): ChiriAnimate => {
		return {
			type: "animate",
			shorthand,
			content: body,
			position,
		}
	})
