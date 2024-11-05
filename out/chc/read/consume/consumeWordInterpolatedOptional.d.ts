import type ChiriReader from "../ChiriReader";
import type { ChiriBaseText, ChiriInterpolationVariable, ChiriTextRaw } from "./consumeValueText";
import { type ChiriExpressionOperand } from "./expression/consumeExpression";
export interface ChiriWordInterpolated extends ChiriBaseText {
    subType: "word-interpolated";
    content: (ChiriTextRaw | ChiriInterpolationVariable | ChiriExpressionOperand | string)[];
}
declare const _default: (reader: ChiriReader, skipStartRequirements?: boolean) => ChiriWordInterpolated | undefined;
export default _default;
