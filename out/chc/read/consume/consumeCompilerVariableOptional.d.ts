import type { ChiriType } from "../../type/ChiriType";
import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
import { type ChiriWord } from "./consumeWord";
import type { ChiriExpressionResult } from "./expression/consumeExpression";
export interface ChiriCompilerVariable {
    type: "variable";
    valueType: ChiriType;
    name: ChiriWord;
    expression?: ChiriExpressionResult;
    position: ChiriPosition;
    assignment?: "=" | "??=";
}
declare const _default: (reader: ChiriReader, prefix?: boolean, skipInvalidParamCheck?: true) => Promise<ChiriCompilerVariable | undefined>;
export default _default;
