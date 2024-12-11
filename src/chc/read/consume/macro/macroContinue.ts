import type { ChiriPosition } from "../../ChiriReader"
import consumeLabelOptional from "../consumeLabelOptional"
import type { ChiriWord } from "../consumeWord"
import MacroConstruct from "./MacroConstruct"

export interface ChiriContinue {
	type: "continue"
	label?: ChiriWord
	position: ChiriPosition
}

export default MacroConstruct("continue")
	.consume(({ reader, position }): ChiriContinue => {
		const label = consumeLabelOptional(reader)
		return {
			type: "continue",
			label,
			position,
		}
	})
