import type { ChiriAST } from "../read/ChiriReader";
import type { ChiriProperty } from "../read/consume/consumePropertyOptional";
import type { ChiriWord } from "../read/consume/consumeWord";
import type ChiriCompiler from "./ChiriCompiler";
import type { ChiriWriteConfig, QueuedWrite } from "./Writer";
import Writer from "./Writer";
export interface ResolvedProperty extends Omit<ChiriProperty, "property" | "value"> {
    property: ChiriWord;
    value: string;
}
export default class CSSWriter extends Writer {
    private writingToType;
    private rootQueue;
    protected get queue(): QueuedWrite[];
    constructor(ast: ChiriAST, dest: string, config?: ChiriWriteConfig);
    createDestPath(outFile: string): string;
    writingTo(writingTo: "default" | "root", dowhile: () => any): void;
    emitProperty(compiler: ChiriCompiler, property: ResolvedProperty): void;
    onCompileEnd(compiler: ChiriCompiler): void;
}
