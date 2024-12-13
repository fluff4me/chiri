import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ChiriExpressionOperand } from "../expression/consumeExpression";
import type { ChiriMacroBlock } from "./MacroConstruct";
export interface ChiriIf extends ChiriMacroBlock {
    type: "if" | "elseif";
    condition: ChiriExpressionOperand;
    content: ChiriStatement[];
    position: ChiriPosition;
}
export interface ChiriElse extends ChiriMacroBlock {
    type: "else";
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriIf>;
export default _default;
export declare const macroIfElse: import("./MacroConstruct").ChiriMacroInternal<ChiriIf>;
export declare const macroElse: import("./MacroConstruct").ChiriMacroInternal<ChiriElse>;
