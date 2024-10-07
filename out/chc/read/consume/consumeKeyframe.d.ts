import type ChiriReader from "../ChiriReader";
import type { ChiriPosition, ChiriStatement } from "../ChiriReader";
import type { ChiriExpressionOperand } from "./expression/consumeExpression";
export interface ChiriKeyframe {
    type: "keyframe";
    at: ChiriExpressionOperand;
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader) => Promise<ChiriKeyframe>;
export default _default;
