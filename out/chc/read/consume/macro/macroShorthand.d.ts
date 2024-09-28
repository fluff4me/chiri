import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional";
export interface ChiriShorthand {
    type: "shorthand";
    property: ChiriWordInterpolated;
    body: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriShorthand>;
export default _default;
