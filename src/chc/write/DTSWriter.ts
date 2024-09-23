import type { ChiriAST } from "../read/ChiriReader"
import type ChiriCompiler from "./ChiriCompiler"
import type { ChiriWriteConfig } from "./Writer"
import Writer from "./Writer"

export default class DTSWriter extends Writer {

	constructor (ast: ChiriAST, dest: string, config?: ChiriWriteConfig) {
		super(ast, dest, { extension: ".d.ts", ...config })
	}

	override onCompileStart (compiler: ChiriCompiler): void {
		this.writeLineStartBlock("declare const _default: {")
	}

	override onCompileEnd (compiler: ChiriCompiler): void {
		this.writeLineEndBlock("};")
		this.writeLine("export default _default")
	}
}
