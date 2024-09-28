import type ChiriReader from "../ChiriReader";
import type { ChiriPosition, ChiriStatement } from "../ChiriReader";
import type { ChiriContextSpreadable, ChiriContextType, ResolveContextDataTuple } from "./body/Contexts";
import type { ChiriCompilerVariable } from "./consumeCompilerVariableOptional";
import type { ChiriWord } from "./consumeWord";
import type { ChiriExpressionOperand } from "./expression/consumeExpression";
import type { ChiriAlias } from "./macro/macroAlias";
import type { ChiriDo } from "./macro/macroDo";
import type { ChiriEach } from "./macro/macroEach";
import type { ChiriFor } from "./macro/macroFor";
import type { ChiriFunction } from "./macro/macroFunctionDeclaration";
import type { ChiriElse, ChiriIf } from "./macro/macroIf";
import type { ChiriImport } from "./macro/macroImport";
import type { ChiriInclude } from "./macro/macroInclude";
import type { ChiriMacro } from "./macro/macroMacroDeclaration";
import type { ChiriAssignment } from "./macro/macroSet";
import type { ChiriShorthand } from "./macro/macroShorthand";
import type { ChiriWhile } from "./macro/macroWhile";
export type MacroResult = ChiriCompilerVariable | ChiriMacro | ChiriMacroUse | ChiriShorthand | ChiriImport | ChiriEach | ChiriAlias | ChiriDo | ChiriAssignment | ChiriFor | ChiriFunction | ChiriWhile | ChiriIf | ChiriElse | ChiriInclude;
export default function (reader: ChiriReader): Promise<MacroResult | undefined>;
export default function <CONTEXT extends ChiriContextType>(reader: ChiriReader, context: CONTEXT, ...data: ResolveContextDataTuple<CONTEXT>): Promise<MacroResult | undefined>;
export default function (reader: ChiriReader, ...context: ChiriContextSpreadable): Promise<MacroResult | undefined>;
export interface ChiriMacroUse {
    type: "macro-use";
    name: ChiriWord;
    assignments: Record<string, ChiriExpressionOperand>;
    content: ChiriStatement[];
    position: ChiriPosition;
}
