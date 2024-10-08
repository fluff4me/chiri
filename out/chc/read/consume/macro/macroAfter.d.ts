import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional";
export interface ChiriAfter {
    type: "after";
    content: ChiriWordInterpolated[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriAfter>;
export default _default;
