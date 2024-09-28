import { ChiriType } from "../../../type/ChiriType";
import type ChiriReader from "../../ChiriReader";
import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriWord } from "../consumeWord";
import type { ChiriExpressionOperand } from "./consumeExpression";
export interface ChiriFunctionCall {
    type: "function-call";
    name: ChiriWord;
    assignments: Record<string, ChiriExpressionOperand>;
    valueType: ChiriType;
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader, ...expectedTypes: ChiriType[]) => ChiriFunctionCall | undefined;
export default _default;
