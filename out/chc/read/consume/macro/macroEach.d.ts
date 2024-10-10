import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional";
import type { ChiriExpressionOperand } from "../expression/consumeExpression";
export interface ChiriEach {
    type: "each";
    iterable: ChiriExpressionOperand;
    keyVariable?: ChiriCompilerVariable;
    variable: ChiriCompilerVariable;
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriEach>;
export default _default;
