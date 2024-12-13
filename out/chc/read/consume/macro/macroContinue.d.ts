import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriWord } from "../consumeWord";
export interface ChiriContinue {
    type: "continue";
    label?: ChiriWord;
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriContinue>;
export default _default;
