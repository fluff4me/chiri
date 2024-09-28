import type { ChiriType, ChiriTypeGeneric } from "../../../type/ChiriType";
import type { ChiriMacroBase } from "./MacroConstruct";
export interface ChiriFunction extends ChiriMacroBase {
    type: "function";
    generics: ChiriTypeGeneric[];
    returnType: ChiriType;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriFunction>;
export default _default;
