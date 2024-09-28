import path from "path"
import args from "../../args"
import type { ChiriAST } from "../read/ChiriReader"
import type ChiriCompiler from "./ChiriCompiler"
import type { ChiriWriteConfig } from "./Writer"
import Writer from "./Writer"

export default class DTSWriter extends Writer {

	constructor (ast: ChiriAST, dest: string, config?: ChiriWriteConfig) {
		super(ast, dest, { extension: ".d.ts", ...config })
	}

	override createDestPath (outFile: string): string {
		return typeof args["out-dts"] === "string" ? path.resolve(args["out-dts"], outFile) : super.createDestPath(outFile)
	}

	override onCompileStart (compiler: ChiriCompiler): void {
		this.writeLineStartBlock("declare const _default: {")
	}

	override onCompileEnd (compiler: ChiriCompiler): void {
		this.writeLineEndBlock("};")
		this.writeLine("export default _default")
	}
}
