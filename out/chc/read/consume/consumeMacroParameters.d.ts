import type ChiriReader from "../ChiriReader";
import type { ChiriExpressionOperand } from "./expression/consumeExpression";
import type { ChiriMacroBase } from "./macro/MacroConstruct";
declare const _default: (reader: ChiriReader, start: number, fn: ChiriMacroBase) => Record<string, ChiriExpressionOperand>;
export default _default;
