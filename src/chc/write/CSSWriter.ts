import type { ChiriAST, ChiriWriteConfig } from "../ChiriAST"
import Writer from "./Writer"

export default class CSSWriter extends Writer {

	constructor (ast: ChiriAST, dest: string, config?: ChiriWriteConfig) {
		super(ast, dest, { extension: ".css", ...config })
	}
}
