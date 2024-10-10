import type { ChiriType } from "../../type/ChiriType";
import type { ChiriLiteralList } from "../../type/typeList";
import type { ChiriLiteralRecord } from "../../type/typeRecord";
import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
import type { ChiriLiteralString } from "./consumeStringOptional";
import type { ChiriLiteralNumeric } from "./numeric/Numeric";
export interface ChiriLiteralBool {
    type: "literal";
    subType: "bool";
    valueType: ChiriType;
    value: boolean;
    position: ChiriPosition;
}
export interface ChiriLiteralUndefined {
    type: "literal";
    subType: "undefined";
    valueType: ChiriType;
    position: ChiriPosition;
    value?: undefined;
}
export type ChiriLiteralValue = ChiriLiteralString | ChiriLiteralNumeric | ChiriLiteralBool | ChiriLiteralUndefined | ChiriLiteralList | ChiriLiteralRecord;
declare const _default: (reader: ChiriReader, type?: ChiriType) => ChiriLiteralValue | undefined;
export default _default;
