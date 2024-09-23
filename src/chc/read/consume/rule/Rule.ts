import type { ChiriStatement } from "../../ChiriReader"
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional"


export interface ChiriRule {
	type: "rule"
	className: ChiriWordInterpolated | undefined
	state: ChiriWordInterpolated | undefined
	content: ChiriStatement[]
}
