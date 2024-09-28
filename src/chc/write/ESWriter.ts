import path from "path"
import args from "../../args"
import type { ChiriAST } from "../read/ChiriReader"
import type ChiriCompiler from "./ChiriCompiler"
import type { ChiriWriteConfig } from "./Writer"
import Writer from "./Writer"

const UMD_PREFIX = `
(factory => {
	if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports)
        if (v !== undefined) module.exports = v
    }
    else if (typeof define === "function" && define.amd)
        define(["require", "exports"], factory)
})((require, exports) => {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })`

	.trimStart()

const UMD_SUFFIX = `
})`
	.trimStart()

export default class ESWriter extends Writer {

	constructor (ast: ChiriAST, dest: string, config?: ChiriWriteConfig) {
		super(ast, dest, { extension: ".js", ...config })
	}

	override createDestPath (outFile: string): string {
		return typeof args["out-es"] === "string" ? path.resolve(args["out-es"], outFile) : super.createDestPath(outFile)
	}

	override onCompileStart (compiler: ChiriCompiler): void {
		this.writeLineStartBlock(UMD_PREFIX)
		this.writeLineStartBlock("exports.default = {")
	}

	override onCompileEnd (compiler: ChiriCompiler): void {
		this.writeLineEndBlock("};")
		this.writeLineEndBlock(UMD_SUFFIX)

		this.write(`\n//# sourceMappingURL=data:application/json;base64,${btoa(this.map.toString())}`)
	}
}
