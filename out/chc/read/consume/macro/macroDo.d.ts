import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriMacroBlock } from "./MacroConstruct";
export interface ChiriDo extends ChiriMacroBlock {
    type: "do";
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriDo>;
export default _default;
