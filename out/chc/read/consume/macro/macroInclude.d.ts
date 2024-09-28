import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriWord } from "../consumeWord";
export interface ChiriInclude {
    type: "include";
    name: ChiriWord;
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriInclude>;
export default _default;
