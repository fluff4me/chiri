import type { ChiriPosition } from "../read/ChiriReader";
import type { ChiriLiteralString } from "../read/consume/consumeStringOptional";
import type { ChiriWord } from "../read/consume/consumeWord";
import type { ChiriWordInterpolated } from "../read/consume/consumeWordInterpolatedOptional";
import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression";
import { ChiriType } from "./ChiriType";
import TypeDefinition from "./TypeDefinition";
export type ChiriLiteralRecordKeyValueTuple = [key: ChiriLiteralString | ChiriWordInterpolated, value: ChiriExpressionOperand];
export interface ChiriFunctionReference {
    type: "literal";
    subType: "function";
    valueType: ChiriType;
    name: ChiriWord;
    position: ChiriPosition;
}
declare const _default: TypeDefinition<"function">;
export default _default;
