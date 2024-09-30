import type { ChiriAST } from "../read/ChiriReader";
import type { ChiriProperty } from "../read/consume/consumePropertyOptional";
import type { ChiriWord } from "../read/consume/consumeWord";
import type ChiriCompiler from "./ChiriCompiler";
import type { ChiriWriteConfig } from "./Writer";
import Writer, { QueuedWrite } from "./Writer";
export interface ResolvedProperty extends Omit<ChiriProperty, "property" | "value"> {
    property: ChiriWord;
    value: string;
}
export type CSSDocumentSection = "imports" | "root-properties" | "root-styles" | "default";
export default class CSSWriter extends Writer {
    private currentSection;
    private queues;
    protected get queue(): QueuedWrite[];
    constructor(ast: ChiriAST, dest: string, config?: ChiriWriteConfig);
    createDestPath(outFile: string): string;
    writingTo(section: CSSDocumentSection, dowhile: () => any): void;
    emitProperty(compiler: ChiriCompiler, property: ResolvedProperty): void;
    onCompileEnd(compiler: ChiriCompiler): void;
}
