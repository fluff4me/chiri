import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import type { ChiriWord } from "../consumeWord"
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional"

export interface ChiriComponent {
	type: "component"
	className: ChiriWordInterpolated | undefined
	states: ChiriWord[]
	content: ChiriStatement[]
	position: ChiriPosition
}
