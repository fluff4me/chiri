import type { ChiriLiteralValue } from "../read/consume/consumeTypeConstructorOptional";
import type { ChiriLiteralRange } from "../read/consume/expression/consumeRangeOptional";
import type ChiriCompiler from "../write/ChiriCompiler";
import type { default as resolveExpressionType } from "./resolveExpression";
import { Record } from "./resolveExpression";
import type { default as stringifyExpressionType } from "./stringifyExpression";
declare function resolveLiteralValue(compiler: ChiriCompiler, expression: ChiriLiteralValue): string | number | boolean | Record | import("./resolveExpression").Value[] | undefined;
export declare function resolveLiteralRange(compiler: ChiriCompiler, range: ChiriLiteralRange, list?: string | any[]): number[];
declare namespace resolveLiteralValue {
    let stringifyExpression: typeof stringifyExpressionType;
    let resolveExpression: typeof resolveExpressionType;
}
export default resolveLiteralValue;
