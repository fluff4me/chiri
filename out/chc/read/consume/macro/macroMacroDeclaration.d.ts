import type { ChiriMacroBase } from "./MacroConstruct";
export interface ChiriMacro extends ChiriMacroBase {
    type: "macro";
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriMacro>;
export default _default;
