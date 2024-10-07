import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional";
export interface ChiriAnimation {
    type: "animation";
    name: ChiriWordInterpolated;
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriAnimation>;
export default _default;
