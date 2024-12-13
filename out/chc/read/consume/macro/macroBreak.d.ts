import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriWord } from "../consumeWord";
export interface ChiriBreak {
    type: "break";
    label?: ChiriWord;
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriBreak>;
export default _default;
