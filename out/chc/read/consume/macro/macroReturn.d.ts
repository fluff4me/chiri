import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriExpressionResult } from "../expression/consumeExpression";
export interface ChiriReturn {
    type: "return";
    expression: ChiriExpressionResult;
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriReturn>;
export default _default;
