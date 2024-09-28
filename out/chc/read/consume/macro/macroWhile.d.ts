import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriExpressionOperand } from "../expression/consumeExpression";
export interface ChiriWhile {
    type: "while";
    condition: ChiriExpressionOperand;
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriWhile>;
export default _default;
