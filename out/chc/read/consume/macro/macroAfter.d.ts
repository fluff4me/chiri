import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
export interface ChiriAfter {
    type: "after";
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriAfter>;
export default _default;
