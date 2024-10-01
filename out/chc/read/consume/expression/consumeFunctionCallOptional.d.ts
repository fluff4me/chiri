import { ChiriType } from "../../../type/ChiriType";
import type ChiriReader from "../../ChiriReader";
import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional";
import type { ChiriWord } from "../consumeWord";
import type { ChiriFunction } from "../macro/macroFunctionDeclaration";
import type { ChiriExpressionResult } from "./consumeExpression";
export interface ChiriFunctionCall {
    type: "function-call";
    name: ChiriWord;
    assignments: Record<string, ChiriExpressionResult>;
    valueType: ChiriType;
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader, ...expectedTypes: ChiriType[]) => ChiriFunctionCall | undefined;
export default _default;
export declare function consumePartialFuntionCall(reader: ChiriReader, position: ChiriPosition, name: ChiriWord, fn: ChiriFunction, parameters: ChiriCompilerVariable[], ...expectedTypes: ChiriType[]): ChiriFunctionCall;
