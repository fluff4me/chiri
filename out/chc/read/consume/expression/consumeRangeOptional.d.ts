import { ChiriType } from "../../../type/ChiriType";
import type ChiriReader from "../../ChiriReader";
import type { ChiriPosition } from "../../ChiriReader";
import type consumeExpressionType from "./consumeExpression";
import type { ChiriExpressionOperand } from "./consumeExpression";
export interface ChiriLiteralRange {
    type: "literal";
    subType: "range";
    valueType: ChiriType;
    start?: ChiriExpressionOperand;
    end?: ChiriExpressionOperand;
    inclusive?: true;
    position: ChiriPosition;
}
declare const _default: ((reader: ChiriReader, listSlice?: true, start?: ChiriExpressionOperand) => ChiriLiteralRange | undefined) & {
    setConsumeExpression(ExpressionIn: typeof consumeExpressionType): void;
    setCheckingForRange(checkingForRangeIn: boolean): void;
};
export default _default;
