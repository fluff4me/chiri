import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
export interface ChiriDo {
    type: "do";
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriDo>;
export default _default;
