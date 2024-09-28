import type { ChiriType } from "../../../type/ChiriType";
import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriExpressionOperand, ChiriExpressionResult } from "./consumeExpression";
import ExpressionConstruct from "./ExpressionConstruct";
export interface ChiriExpressionMatch {
    type: "match";
    value: ChiriExpressionOperand;
    cases: ChiriExpressionMatchCase[];
    elseCase?: ChiriExpressionMatchElse;
    position: ChiriPosition;
    valueType: ChiriType;
}
export interface ChiriExpressionMatchCase {
    type: "match-case";
    condition: ChiriExpressionOperand;
    expression: ChiriExpressionResult;
    position: ChiriPosition;
}
export interface ChiriExpressionMatchElse {
    type: "match-else";
    expression: ChiriExpressionResult;
    position: ChiriPosition;
}
declare const _default: ExpressionConstruct<ChiriExpressionMatch>;
export default _default;
