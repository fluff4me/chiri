import type { ChiriAST } from "../read/ChiriReader";
import type { ChiriWord } from "../read/consume/consumeWord";
import type ChiriCompiler from "./ChiriCompiler";
import type { ChiriWriteConfig } from "./Writer";
import Writer from "./Writer";
export interface ResolvedComponent {
    selector: ChiriWord;
    mixins: string[];
}
export default class ESWriter extends Writer {
    constructor(ast: ChiriAST, dest: string, config?: ChiriWriteConfig);
    createDestPath(outFile: string): string;
    onCompileStart(compiler: ChiriCompiler): void;
    emitComponent(compiler: ChiriCompiler, component: ResolvedComponent): void;
    onCompileEnd(compiler: ChiriCompiler): void;
}
