import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional";
export interface ChiriAlias {
    type: "alias";
    property: ChiriWordInterpolated;
    body: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriAlias>;
export default _default;
