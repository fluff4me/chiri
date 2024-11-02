import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriExpressionOperand } from "../expression/consumeExpression";
export interface ChiriSelect {
    type: "select";
    selector: ChiriExpressionOperand;
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriSelect>;
export default _default;
