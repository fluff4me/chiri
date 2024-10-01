import { ChiriType } from "../../../type/ChiriType";
import type { Operator } from "../../../type/ChiriTypeManager";
import type ChiriReader from "../../ChiriReader";
import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriLiteralValue } from "../consumeTypeConstructorOptional";
import type { ChiriValueText } from "../consumeValueText";
import type { ChiriWord } from "../consumeWord";
import type { ChiriFunctionCall } from "./consumeFunctionCallOptional";
import type { ChiriExpressionMatch } from "./expressionMatch";
export interface ChiriBinaryExpression {
    type: "expression";
    subType: "binary";
    operandA: ChiriExpressionOperand;
    operandB: ChiriExpressionResult;
    operator: string;
    valueType: ChiriType;
    position: ChiriPosition;
}
export interface ChiriUnaryExpression {
    type: "expression";
    subType: "unary";
    operand: ChiriExpressionOperand;
    operator: string;
    valueType: ChiriType;
    position: ChiriPosition;
}
export interface ChiriVariableReference {
    type: "get";
    name: ChiriWord;
    valueType: ChiriType;
    position: ChiriPosition;
}
export interface ChiriPipe {
    type: "pipe";
    left: ChiriExpressionOperand;
    right: ChiriExpressionResult;
    valueType: ChiriType;
    position: ChiriPosition;
}
export interface ChiriPipeUseLeft {
    type: "pipe-use-left";
    valueType: ChiriType;
    position: ChiriPosition;
}
export type ChiriExpressionOperand = ChiriBinaryExpression | ChiriUnaryExpression | ChiriLiteralValue | ChiriVariableReference | ChiriValueText | ChiriFunctionCall | ChiriPipe | ChiriPipeUseLeft;
export type ChiriExpressionResult = ChiriExpressionOperand | ChiriExpressionMatch;
export type ExpressionOperandConsumer = (reader: ChiriReader, ...expectedTypes: ChiriType[]) => ChiriExpressionOperand;
declare function consumeExpression(reader: ChiriReader, ...expectedTypes: ChiriType[]): Promise<ChiriExpressionResult>;
declare namespace consumeExpression {
    function inline(reader: ChiriReader, ...expectedTypes: ChiriType[]): ChiriExpressionOperand;
}
export default consumeExpression;
export declare function consumeOperatorOptional(reader: ChiriReader, operators: Partial<Record<Operator, Record<string, string | undefined>>>, precedence?: number): Operator | undefined;
