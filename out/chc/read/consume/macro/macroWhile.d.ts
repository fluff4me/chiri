import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriExpressionOperand } from "../expression/consumeExpression";
import type { ChiriMacroBlock } from "./MacroConstruct";
export interface ChiriWhile extends ChiriMacroBlock {
    type: "while";
    condition: ChiriExpressionOperand;
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriWhile>;
export default _default;
