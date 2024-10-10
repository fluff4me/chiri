import { ChiriType } from "../../../type/ChiriType";
import type ChiriReader from "../../ChiriReader";
import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriLiteralNumeric } from "../numeric/Numeric";
import type { ChiriVariableReference } from "./consumeExpression";
export interface ChiriLiteralRange {
    type: "literal";
    subType: "range";
    valueType: ChiriType;
    start?: ChiriLiteralNumeric | ChiriVariableReference;
    end?: ChiriLiteralNumeric | ChiriVariableReference;
    inclusive?: true;
    position: ChiriPosition;
}
export default function (reader: ChiriReader, listSlice?: true): ChiriLiteralRange | undefined;
