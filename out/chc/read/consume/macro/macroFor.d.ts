import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional";
import type { ChiriExpressionOperand } from "../expression/consumeExpression";
export interface ChiriFor {
    type: "for";
    variable: ChiriCompilerVariable;
    condition: ChiriExpressionOperand;
    update?: ChiriStatement;
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriFor>;
export default _default;
