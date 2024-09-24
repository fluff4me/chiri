import type { ChiriAST } from "../read/ChiriReader"
import type ChiriCompiler from "./ChiriCompiler"
import type { ChiriWriteConfig } from "./Writer"
import Writer from "./Writer"

export default class CSSWriter extends Writer {

	constructor (ast: ChiriAST, dest: string, config?: ChiriWriteConfig) {
		super(ast, dest, { extension: ".css", ...config })
	}

	override onCompileEnd (compiler: ChiriCompiler): void {
		this.output += `\n/*# sourceMappingURL=data:application/json;base64,${btoa(this.map.toString())} */`
	}
}
