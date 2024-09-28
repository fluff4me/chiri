import type { ChiriExpressionResult } from "../read/consume/expression/consumeExpression";
import type ChiriCompiler from "../write/ChiriCompiler";
export type Literal = undefined | number | boolean | string;
export type Value = Literal | Value[];
declare const resolveExpression: (compiler: ChiriCompiler, expression?: ChiriExpressionResult) => Value;
export default resolveExpression;
