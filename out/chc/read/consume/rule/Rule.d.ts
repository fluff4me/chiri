import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriBaseText } from "../consumeValueText";
import type { ChiriWord } from "../consumeWord";
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional";
export interface ChiriComponentBase {
    type: "component";
    subType: string;
    spread?: boolean;
    content: ChiriStatement[];
    position: ChiriPosition;
}
export interface ChiriComponent extends ChiriComponentBase {
    subType: "component";
    spread?: undefined;
    names: ChiriWordInterpolated[];
}
export interface ChiriComponentCustomState extends ChiriComponentBase {
    subType: "custom-state";
    spread?: undefined;
    names: ChiriWordInterpolated[];
}
export interface ChiriComponentDescendantElement extends ChiriComponentBase {
    subType: "element";
    spread: boolean;
    names: ChiriWordInterpolated[];
}
export interface ChiriComponentState extends ChiriComponentBase {
    subType: "state";
    spread: boolean;
    states: ChiriWord[];
}
export interface ChiriComponentStateSpecial extends ChiriComponentBase {
    subType: "state-special";
    spread: boolean;
    state: ChiriWord;
}
export interface ChiriComponentStateContainer extends ChiriComponentBase {
    subType: "container";
    spread: boolean;
    query: ChiriBaseText;
}
export interface ChiriComponentStateScheme extends ChiriComponentBase {
    subType: "scheme";
    spread: boolean;
    scheme: "dark" | "light";
}
export type PseudoName = "before" | "after" | "backdrop";
export interface ChiriComponentPseudo extends ChiriComponentBase {
    subType: "pseudo";
    spread: boolean;
    pseudos: ChiriWord<PseudoName>[];
}
export interface ChiriComponentViewTransition extends ChiriComponentBase {
    subType: "view-transition";
    spread: boolean;
    pseudos: ChiriWord<"view-transition!old" | "view-transition!new" | "view-transition!image-pair">[];
}
export interface ChiriComponentViewTransitionClass extends ChiriComponentBase {
    subType: "view-transition-class";
    spread: boolean;
    pseudos: ChiriWord<"view-transition-class!old" | "view-transition-class!new" | "view-transition-class!group" | "view-transition-class!image-pair">[];
}
