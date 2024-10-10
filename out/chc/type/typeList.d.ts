import type { ChiriPosition } from "../read/ChiriReader";
import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression";
import { ChiriType } from "./ChiriType";
import TypeDefinition from "./TypeDefinition";
export interface ChiriLiteralListSpread {
    type: "list-spread";
    value: ChiriExpressionOperand;
    position: ChiriPosition;
}
export interface ChiriLiteralList {
    type: "literal";
    subType: "list";
    valueType: ChiriType;
    value: (ChiriExpressionOperand | ChiriLiteralListSpread)[];
    position: ChiriPosition;
}
declare const _default: TypeDefinition<"list">;
export default _default;
