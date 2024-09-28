import type { ChiriAST } from "../read/ChiriReader";
import type ChiriCompiler from "./ChiriCompiler";
import type { ChiriWriteConfig } from "./Writer";
import Writer from "./Writer";
export default class DTSWriter extends Writer {
    constructor(ast: ChiriAST, dest: string, config?: ChiriWriteConfig);
    createDestPath(outFile: string): string;
    onCompileStart(compiler: ChiriCompiler): void;
    onCompileEnd(compiler: ChiriCompiler): void;
}
