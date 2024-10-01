import type { ChiriExpressionResult } from "../read/consume/expression/consumeExpression";
import type ChiriCompiler from "../write/ChiriCompiler";
import type { default as stringifyTextType } from "./stringifyText";
export type Literal = undefined | number | boolean | string;
export type Value = Literal | Value[];
declare function resolveExpression(compiler: ChiriCompiler, expression?: ChiriExpressionResult): Value;
declare namespace resolveExpression {
    let stringifyText: typeof stringifyTextType;
}
export default resolveExpression;
