import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
import type { ChiriWord } from "./consumeWord";
import type { ChiriExpressionOperand } from "./expression/consumeExpression";
export interface ChiriMixinUse {
    type: "mixin-use";
    name: ChiriWord;
    assignments: Record<string, ChiriExpressionOperand>;
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader) => ChiriMixinUse | undefined;
export default _default;
