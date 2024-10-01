import { ChiriType } from "../../type/ChiriType";
import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
import type { ChiriWord } from "./consumeWord";
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional";
import { type ChiriExpressionOperand } from "./expression/consumeExpression";
export interface ChiriInterpolationVariable {
    type: "interpolation-variable";
    name: ChiriWord;
    position: ChiriPosition;
}
export interface ChiriInterpolationProperty {
    type: "interpolation-property";
    name: ChiriWordInterpolated;
    position: ChiriPosition;
}
export interface ChiriTextRaw {
    type: "text-raw";
    text: string;
    position: ChiriPosition;
}
export interface ChiriValueText {
    type: "text";
    valueType: ChiriType;
    content: (ChiriTextRaw | ChiriInterpolationVariable | ChiriInterpolationProperty | ChiriExpressionOperand | string)[];
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader, multiline: boolean, until?: () => boolean) => ChiriValueText;
export default _default;
