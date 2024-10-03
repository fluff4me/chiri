import { ChiriType } from "../../type/ChiriType";
import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
import type { ChiriInterpolationProperty, ChiriInterpolationPropertyName } from "./consumeCustomPropertyInterpolation";
import type { ChiriWord } from "./consumeWord";
import { type ChiriExpressionOperand } from "./expression/consumeExpression";
export interface ChiriInterpolationVariable {
    type: "interpolation-variable";
    name: ChiriWord;
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
    content: (ChiriTextRaw | ChiriInterpolationVariable | ChiriInterpolationProperty | ChiriInterpolationPropertyName | ChiriExpressionOperand | string)[];
    position: ChiriPosition;
}
export default function consumeValueText(reader: ChiriReader, multiline: boolean, until?: () => boolean): ChiriValueText;
