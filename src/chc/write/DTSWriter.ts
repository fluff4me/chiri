import type { ChiriAST } from "../read/ChiriReader"
import type { ChiriWriteConfig } from "./Writer"
import Writer from "./Writer"

export default class DTSWriter extends Writer {

	constructor (ast: ChiriAST, dest: string, config?: ChiriWriteConfig) {
		super(ast, dest, { extension: ".d.ts", ...config })
	}
}
