import type { ChiriPosition } from "../read/ChiriReader";
import type { ChiriLiteralString } from "../read/consume/consumeStringOptional";
import type { ChiriWordInterpolated } from "../read/consume/consumeWordInterpolatedOptional";
import type { ChiriExpressionOperand, ChiriExpressionResult } from "../read/consume/expression/consumeExpression";
import { ChiriType } from "./ChiriType";
import TypeDefinition from "./TypeDefinition";
export type ChiriLiteralRecordKeyValueTuple = [key: ChiriLiteralString | ChiriWordInterpolated, value: ChiriExpressionOperand];
export interface ChiriLiteralRecord {
    type: "literal";
    subType: "record";
    valueType: ChiriType;
    value: (ChiriLiteralRecordKeyValueTuple | ChiriExpressionResult)[];
    position: ChiriPosition;
}
declare const _default: TypeDefinition<"record">;
export default _default;
