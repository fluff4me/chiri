import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import type { ChiriValueText } from "../consumeValueText"
import type { ChiriWord } from "../consumeWord"
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional"

export interface ChiriComponentBase {
	type: "component"
	subType: string
	content: ChiriStatement[]
	position: ChiriPosition
}

export interface ChiriComponent extends ChiriComponentBase {
	subType: "component"
	names: ChiriWordInterpolated[]
}

export interface ChiriComponentCustomState extends ChiriComponentBase {
	subType: "custom-state"
	names: ChiriWordInterpolated[]
}

export interface ChiriComponentState extends ChiriComponentBase {
	subType: "state"
	states: ChiriWord[]
}

export interface ChiriComponentStateSpecial extends ChiriComponentBase {
	subType: "state-special"
	state: ChiriWord
}

export interface ChiriComponentStateContainer extends ChiriComponentBase {
	subType: "container"
	query: ChiriValueText
}

export interface ChiriComponentPseudo extends ChiriComponentBase {
	subType: "pseudo"
	pseudos: ChiriWord<"before" | "after">[]
}

export interface ChiriComponentViewTransition extends ChiriComponentBase {
	subType: "view-transition"
	pseudos: ChiriWord<"view-transition!old" | "view-transition!new">[]
}

export interface ChiriComponentViewTransitionClass extends ChiriComponentBase {
	subType: "view-transition-class"
	pseudos: ChiriWord<"view-transition-class!old" | "view-transition-class!new" | "view-transition-class!group">[]
}
