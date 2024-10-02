import type { ChiriAST, ChiriPosition } from "../read/ChiriReader";
import type { ChiriMixin } from "../read/consume/consumeMixinOptional";
import type { ChiriWord } from "../read/consume/consumeWord";
import type { ChiriFunctionCall } from "../read/consume/expression/consumeFunctionCallOptional";
import type { ChiriFunction } from "../read/consume/macro/macroFunctionDeclaration";
import type { ChiriMacro } from "../read/consume/macro/macroMacroDeclaration";
import { ChiriType } from "../type/ChiriType";
import ChiriTypeManager from "../type/ChiriTypeManager";
import { type ComponentState } from "../util/componentStates";
import type { Value } from "../util/resolveExpression";
import type { ResolvedProperty } from "./CSSWriter";
import CSSWriter from "./CSSWriter";
import DTSWriter from "./DTSWriter";
import ESWriter from "./ESWriter";
import type Writer from "./Writer";
interface PreRegisteredMixin extends Omit<ChiriMixin, "content" | "name"> {
    states: (ComponentState | undefined)[];
    name: ChiriWord;
    content: ResolvedProperty[];
    affects: string[];
}
interface ErrorPositioned extends Error {
    position?: ChiriPosition;
}
interface ChiriCompiler {
    readonly ast: ChiriAST;
    readonly types: ChiriTypeManager;
    readonly css: CSSWriter;
    readonly es: ESWriter;
    readonly dts: DTSWriter;
    readonly writers: readonly Writer[];
    readonly pipeValueStack: Value[];
    compile(): void;
    writeFiles(): Promise<void>;
    error(message?: string): ErrorPositioned;
    error(position?: ChiriPosition, message?: string): ErrorPositioned;
    logLine(position?: ChiriPosition, message?: string | ErrorPositioned): void;
    getVariable(name: string, position: ChiriPosition): Value;
    setVariable(name: string, value: Value, type: ChiriType): void;
    getMixin(name: string, position: ChiriPosition): PreRegisteredMixin;
    setMixin(mixin: PreRegisteredMixin): void;
    getShorthand(property: string): string[];
    setShorthand(property: string, affects: string[], position: ChiriPosition): void;
    getAlias(property: string): string[];
    setAlias(property: string, aliases: string[], position: ChiriPosition): void;
    getMacro(name: string, position: ChiriPosition): ChiriMacro;
    setMacro(fn: ChiriMacro): void;
    getFunction(name: string, position: ChiriPosition): ChiriFunction;
    setFunction(fn: ChiriFunction): void;
    callFunction(fn: ChiriFunctionCall): Value;
}
declare function ChiriCompiler(ast: ChiriAST, dest: string): ChiriCompiler;
export default ChiriCompiler;
