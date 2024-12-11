import type { ChiriPosition } from "../../ChiriReader"
import consumeLabelOptional from "../consumeLabelOptional"
import type { ChiriWord } from "../consumeWord"
import MacroConstruct from "./MacroConstruct"

export interface ChiriBreak {
	type: "break"
	label?: ChiriWord
	position: ChiriPosition
}

export default MacroConstruct("break")
	.consume(({ reader, position }): ChiriBreak => {
		const label = consumeLabelOptional(reader)
		return {
			type: "break",
			label,
			position,
		}
	})
