import type ChiriReader from "../ChiriReader";
import type { ChiriInterpolationVariable, ChiriTextRaw, ChiriValueText } from "./consumeValueText";
import { type ChiriExpressionOperand } from "./expression/consumeExpression";
export interface ChiriWordInterpolated extends ChiriValueText {
    content: (ChiriTextRaw | ChiriInterpolationVariable | ChiriExpressionOperand | string)[];
}
declare const _default: (reader: ChiriReader) => ChiriWordInterpolated | undefined;
export default _default;
