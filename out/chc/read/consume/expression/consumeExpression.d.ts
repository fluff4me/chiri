import { ChiriType } from "../../../type/ChiriType";
import type { Operator } from "../../../type/ChiriTypeManager";
import type ChiriReader from "../../ChiriReader";
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
    wrapped?: true;
}
export interface ChiriUnaryExpression {
    type: "expression";
    subType: "unary";
    operand: ChiriExpressionOperand;
    operator: string;
    valueType: ChiriType;
}
export interface ChiriVariableReference {
    type: "get";
    name: ChiriWord;
    valueType: ChiriType;
}
export type ChiriExpressionOperand = ChiriBinaryExpression | ChiriUnaryExpression | ChiriLiteralValue | ChiriVariableReference | ChiriValueText | ChiriFunctionCall;
export type ChiriExpressionResult = ChiriExpressionOperand | ChiriExpressionMatch;
export type ExpressionOperandConsumer = (reader: ChiriReader, ...expectedTypes: ChiriType[]) => ChiriExpressionOperand;
declare function consumeExpression(reader: ChiriReader, ...expectedTypes: ChiriType[]): Promise<ChiriExpressionResult>;
declare namespace consumeExpression {
    function inline(reader: ChiriReader, ...expectedTypes: ChiriType[]): ChiriExpressionOperand;
}
export default consumeExpression;
export declare const consumeOperatorOptional: (reader: ChiriReader, operators: Record<Operator, Record<string, string>>) => string | undefined;
