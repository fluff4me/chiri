import { SourceMapGenerator } from "source-map";
import type { ChiriAST, ChiriPosition } from "../read/ChiriReader";
import type { ChiriDocumentation } from "../read/consume/consumeDocumentationOptional";
import type { ChiriValueText } from "../read/consume/consumeValueText";
import type { ChiriWord } from "../read/consume/consumeWord";
import type ChiriCompiler from "./ChiriCompiler";
export interface QueuedWrite {
    output: string;
    mapping?: {
        sourcePosition: ChiriPosition;
        tokenName?: string | undefined;
    };
}
export declare namespace QueuedWrite {
    function makeQueue(): QueuedWrite[];
}
export default class Writer {
    #private;
    readonly config: ChiriWriteConfig;
    static writeBlocks(writers: Writer[], inside: () => any): void;
    readonly dest: string;
    private output;
    protected outputQueue: QueuedWrite[];
    readonly map: SourceMapGenerator;
    protected get queue(): QueuedWrite[];
    protected get currentWrite(): QueuedWrite;
    constructor(ast: ChiriAST, dest: string, config: ChiriWriteConfig);
    createDestPath(outFile: string): string;
    indent(amount?: number): void;
    unindent(amount?: number): void;
    writeFile(): Promise<void>;
    write(text: string): void;
    writeLine(text: string): void;
    writeLineStartBlock(text: string): void;
    writeLineEndBlock(text: string): void;
    writeTextInterpolated(compiler: ChiriCompiler, source: ChiriValueText): void;
    writeWord(source: ChiriWord): void;
    writeNewLine(): void;
    getNewLineOptional(): string;
    getSpaceOptional(): string;
    writeNewLineOptional(): void;
    writeSpaceOptional(): void;
    writeBlock(inside: () => any): void;
    writeDocumentation(documentation: ChiriDocumentation): void;
    onCompileStart(compiler: ChiriCompiler): void;
    onCompileEnd(compiler: ChiriCompiler): void;
    private addMapping;
    getLineStart(at?: number): number;
    getLineEnd(at?: number): number;
    getPosition(at?: number): Omit<ChiriPosition, "file">;
    getLineNumber(at?: number): number;
    getColumnNumber(at?: number): number;
}
export interface ChiriWriteConfig {
    extension: `.${string}`;
}
