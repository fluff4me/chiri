import type ChiriReader from "../../ChiriReader";
import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriWord } from "../consumeWord";
import type { ChiriExpressionResult } from "../expression/consumeExpression";
export interface ChiriAssignment {
    type: "assignment";
    name: ChiriWord;
    expression?: ChiriExpressionResult;
    position: ChiriPosition;
    assignment: "=" | "??=";
}
export declare const consumeAssignmentOptional: (reader: ChiriReader, inline?: boolean) => Promise<ChiriAssignment | undefined>;
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriAssignment>;
export default _default;
