import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriWord } from "../consumeWord";
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional";
export interface ChiriComponentBase {
    type: "component";
    subType: string;
    content: ChiriStatement[];
    position: ChiriPosition;
}
export interface ChiriComponent extends ChiriComponentBase {
    subType: "component";
    names: ChiriWordInterpolated[];
}
export interface ChiriComponentCustomState extends ChiriComponentBase {
    subType: "custom-state";
    names: ChiriWordInterpolated[];
}
export interface ChiriComponentState extends ChiriComponentBase {
    subType: "state";
    states: ChiriWord[];
}
export interface ChiriComponentPseudo extends ChiriComponentBase {
    subType: "pseudo";
    pseudos: ChiriWord[];
}
