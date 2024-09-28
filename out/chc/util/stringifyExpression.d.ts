import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression";
import type ChiriCompiler from "../write/ChiriCompiler";
import type { Value } from "./resolveExpression";
declare const stringifyExpression: (compiler: ChiriCompiler, expression?: ChiriExpressionOperand | Value) => string;
export default stringifyExpression;
