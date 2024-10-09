import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriValueText } from "../consumeValueText";
export interface ChiriAnimate {
    type: "animate";
    shorthand: ChiriValueText;
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriAnimate>;
export default _default;
