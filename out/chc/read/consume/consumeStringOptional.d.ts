import { ChiriType } from "../../type/ChiriType";
import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
import type { ChiriExpressionOperand } from "./expression/consumeExpression";
export interface ChiriLiteralString {
    type: "literal";
    subType: "string";
    valueType: ChiriType;
    segments: (string | ChiriExpressionOperand)[];
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader) => ChiriLiteralString | undefined;
export default _default;
