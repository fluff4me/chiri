import { ChiriType } from "../type/ChiriType";
import ChiriTypeManager from "../type/ChiriTypeManager";
import type TypeDefinition from "../type/TypeDefinition";
import type { ArrayOr, PromiseOr } from "../util/Type";
import type { ChiriContext, ChiriContextType, ResolveContextDataTuple } from "./consume/body/Contexts";
import type { ChiriCompilerVariable } from "./consume/consumeCompilerVariableOptional";
import { type ChiriDocumentation } from "./consume/consumeDocumentationOptional";
import type { ChiriKeyframe } from "./consume/consumeKeyframe";
import type { ChiriMacroUse, MacroResult } from "./consume/consumeMacroUseOptional";
import type { ChiriMixin } from "./consume/consumeMixinOptional";
import { type ChiriMixinUse } from "./consume/consumeMixinUseOptional";
import type { ChiriPropertyDefinition } from "./consume/consumePropertyOptional";
import { type ChiriProperty } from "./consume/consumePropertyOptional";
import type { ChiriValueText } from "./consume/consumeValueText";
import type { ChiriWord } from "./consume/consumeWord";
import type { ChiriWordInterpolated } from "./consume/consumeWordInterpolatedOptional";
import type { ChiriAfter } from "./consume/macro/macroAfter";
import type { ChiriAlias } from "./consume/macro/macroAlias";
import type { ChiriAnimate } from "./consume/macro/macroAnimate";
import type { ChiriAnimation } from "./consume/macro/macroAnimation";
import type { ChiriBreak } from "./consume/macro/macroBreak";
import type { ChiriContinue } from "./consume/macro/macroContinue";
import type { ChiriDo } from "./consume/macro/macroDo";
import type { ChiriEach } from "./consume/macro/macroEach";
import type { ChiriFontFace } from "./consume/macro/macroFontFace";
import type { ChiriFor } from "./consume/macro/macroFor";
import type { ChiriFunction } from "./consume/macro/macroFunctionDeclaration";
import type { ChiriElse, ChiriIf } from "./consume/macro/macroIf";
import type { ChiriCSSImport, ChiriImport } from "./consume/macro/macroImport";
import type { ChiriInclude } from "./consume/macro/macroInclude";
import type { ChiriMacro } from "./consume/macro/macroMacroDeclaration";
import type { ChiriReturn } from "./consume/macro/macroReturn";
import type { ChiriSelect } from "./consume/macro/macroSelect";
import type { ChiriAssignment } from "./consume/macro/macroSet";
import type { ChiriShorthand } from "./consume/macro/macroShorthand";
import type { ChiriWhile } from "./consume/macro/macroWhile";
import type { ChiriComponent, ChiriComponentCustomState, ChiriComponentDescendantElement, ChiriComponentPseudo, ChiriComponentState, ChiriComponentStateContainer, ChiriComponentStateScheme, ChiriComponentStateSpecial, ChiriComponentViewTransition, ChiriComponentViewTransitionClass } from "./consume/rule/Rule";
export interface ChiriPosition {
    file: string;
    line: number;
    column: number;
}
export type ChiriStatement = ChiriDocumentation | ChiriCompilerVariable | ChiriMacro | ChiriMacroUse | ChiriEach | ChiriDo | ChiriAssignment | ChiriFor | ChiriFunction | ChiriReturn | ChiriWhile | ChiriIf | ChiriElse | ChiriInclude | ChiriCSSImport | ChiriImport | ChiriAnimation | ChiriAnimate | ChiriSelect | ChiriBreak | ChiriContinue | ChiriComponent | ChiriMixin | ChiriShorthand | ChiriAlias | ChiriPropertyDefinition | ChiriFontFace | ChiriComponentDescendantElement | ChiriComponentCustomState | ChiriComponentState | ChiriComponentStateSpecial | ChiriComponentStateContainer | ChiriComponentStateScheme | ChiriComponentPseudo | ChiriComponentViewTransition | ChiriComponentViewTransitionClass | ChiriAfter | ChiriProperty | ChiriMixinUse | ChiriWordInterpolated | ChiriKeyframe | ChiriValueText;
export interface ChiriAST<STATEMENT = ChiriStatement> {
    source: Record<string, string>;
    statements: STATEMENT[];
}
export interface ChiriPositionState {
    lastLineNumber: number;
    lastLineNumberPosition: number;
    i: number;
}
export type ChiriBodyConsumer<T> = (reader: ChiriReader) => PromiseOr<ArrayOr<T | undefined>>;
export interface ChiriBlock {
    label?: ChiriWord;
}
export default class ChiriReader {
    #private;
    readonly filename: string;
    readonly input: string;
    readonly context: ChiriContext;
    readonly stack: string[];
    readonly source: Record<string, string>;
    static load(filename: string, reader?: ChiriReader): Promise<ChiriReader>;
    types: ChiriTypeManager;
    i: number;
    indent: number;
    used: Set<string>;
    reusable: Set<string>;
    importName?: string;
    readonly pipeValueStack: {
        type: ChiriType;
        used: boolean;
    }[];
    readonly basename: string;
    readonly dirname: string;
    readonly cwd: string;
    get errored(): boolean;
    get isSubReader(): boolean;
    constructor(filename: string, input: string, cwd?: string, context?: ChiriContext, stack?: string[], source?: Record<string, string>);
    setReusable(): boolean;
    sub<CONTEXT extends ChiriContextType>(multiline: boolean, context: CONTEXT, ...data: ResolveContextDataTuple<CONTEXT>): ChiriReader;
    addOuterStatement(statement: ChiriStatement): this;
    /**
     * Update this reader to the position of the subreader
     */
    update(reader: ChiriReader): void;
    getVariables(onlyThisBlock?: true): ChiriCompilerVariable[];
    getVariableOptional(name: string): ChiriCompilerVariable | undefined;
    getVariable(name: string, start?: number): ChiriCompilerVariable;
    getFunctionOptional(name: string): ChiriFunction | undefined;
    getFunction(name: string, start?: number): ChiriFunction;
    getMacroOptional(name: string): ChiriMacro | undefined;
    with(...scopeStatements: ChiriStatement[]): {
        do: <T>(callback: () => PromiseOr<T>) => Promise<T>;
    };
    getType(name: string | ChiriType): TypeDefinition<string>;
    getTypeOptional(name: string): TypeDefinition | undefined;
    getStatements(onlyThisBlock?: true): readonly ChiriStatement[];
    setExport(): void;
    read(): Promise<ChiriAST>;
    read<STATEMENT = ChiriStatement>(consumer: ChiriBodyConsumer<STATEMENT>): Promise<ChiriAST<STATEMENT>>;
    consumeBodyDefault(macro?: MacroResult): Promise<ChiriStatement | ChiriStatement[]>;
    logState(): void;
    logLine(start?: number, errOrMessage?: Error | string): void;
    formatFilename(): string;
    formatFilePos(lineNumber?: number, columnNumber?: number): string;
    formatFilePosAt(at?: number): string;
    formatFilePosAtFromScratch(at: number): string;
    consume<STRING extends string>(...strings: STRING[]): STRING;
    consumeOptional<STRING extends string>(...strings: STRING[]): STRING | undefined;
    /**
     * @param  {...string} strings
     */
    consumeUntil(...strings: string[]): string;
    peek(...strings: string[]): string | undefined;
    error(message: string): Error;
    error(errorPosition: number, message: string): Error;
    subError(): void;
    getLineStart(at?: number): number;
    getLineEnd(at?: number, includeNewline?: boolean): number;
    savePosition(): ChiriPositionState;
    restorePosition(state: ChiriPositionState): void;
    getPosition(at?: number): ChiriPosition;
    getLineNumber(at?: number, allowRecalc?: boolean): number;
    getColumnNumber(at?: number): number;
    getCurrentLine(at?: number, includeNewline?: boolean): string;
    isWordChar: (charCode?: number) => boolean;
    isLetter: (charCode?: number) => boolean;
    isDigit: (charCode?: number) => boolean;
}
