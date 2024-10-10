import type { ChiriExpressionResult } from "../read/consume/expression/consumeExpression";
import type ChiriCompiler from "../write/ChiriCompiler";
import type { default as stringifyTextType } from "./stringifyText";
export declare const SYMBOL_IS_RECORD: unique symbol;
export type Literal = undefined | number | boolean | string;
export type Record = {
    [KEY in string]: Literal | Literal[];
} & {
    [SYMBOL_IS_RECORD]: true;
};
export type Value = Literal | Value[] | Record;
export declare namespace Record {
    function is(value: unknown): value is Record;
}
declare function resolveExpression(compiler: ChiriCompiler, expression?: ChiriExpressionResult): Value;
declare namespace resolveExpression {
    let stringifyText: typeof stringifyTextType;
}
export default resolveExpression;
