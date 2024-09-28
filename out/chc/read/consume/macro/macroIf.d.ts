import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriExpressionOperand } from "../expression/consumeExpression";
export interface ChiriIf {
    type: "if" | "elseif";
    condition: ChiriExpressionOperand;
    content: ChiriStatement[];
    position: ChiriPosition;
}
export interface ChiriElse {
    type: "else";
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriIf>;
export default _default;
export declare const macroIfElse: import("./MacroConstruct").ChiriMacroInternal<ChiriIf>;
export declare const macroElse: import("./MacroConstruct").ChiriMacroInternal<ChiriElse>;
