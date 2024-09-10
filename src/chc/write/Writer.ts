import fsp from "fs/promises"
import { SourceMapGenerator } from "source-map"
import ansi from "../../ansi"
import type { ChiriAST, ChiriPosition, ChiriValueText, ChiriWord, ChiriWriteConfig } from "../ChiriAST"
import stringifyText from "../util/stringifyText"
import type ChiriCompiler from "./ChiriCompiler"

export default class Writer {

	#indent = 0

	public readonly dest: string
	public output: string
	public readonly map: SourceMapGenerator

	constructor (ast: ChiriAST, dest: string, public readonly config: ChiriWriteConfig) {
		this.dest = dest + config.extension
		this.output = ""

		this.map = new SourceMapGenerator({ file: this.dest })
		for (const [filename, source] of Object.entries(ast.source))
			this.map.setSourceContent(filename, source)
	}

	indent () {
		this.#indent++
	}

	unindent () {
		this.#indent--
		if (this.output[this.output.length - 1] === "\t")
			this.output = this.output.slice(0, -1)
	}

	writeFile () {
		return fsp.writeFile(this.dest, this.output)
	}

	write (text: string) {
		this.output += text
	}

	writeLine (text: string) {
		this.output += text
		this.writeNewLine()
	}

	writeTextInterpolated (compiler: ChiriCompiler, source: ChiriValueText) {
		this.addMapping(source.position)
		this.output += stringifyText(compiler, source)
	}

	writeWord (source: ChiriWord) {
		this.addMapping(source.position, source.value)
		this.output += source.value
	}

	writeNewLine () {
		this.output += "\n" + "\t".repeat(this.#indent)
	}

	writeNewLineOptional () {
		this.writeNewLine()
	}

	writeSpaceOptional () {
		this.output += " "
	}

	writeBlock (inside: () => any) {
		const startIndex = this.output.length
		this.indent()
		this.writeLine("{")
		const insideStartIndex = this.output.length
		inside()
		if (this.output.length === insideStartIndex) {
			this.output = this.output.slice(0, startIndex)
			this.write("{}")
			this.#indent--
			return
		}

		this.unindent()
		this.writeLine("}")
	}

	addMapping (sourcePosition: ChiriPosition, tokenName?: string | undefined) {
		this.map.addMapping({
			generated: this.getPosition(),
			source: sourcePosition.file,
			original: sourcePosition,
			name: tokenName,
		})
	}

	getLineStart (at = this.output.length) {
		return this.output.lastIndexOf("\n", at - 1) + 1
	}

	getLineEnd (at = this.output.length) {
		let index = this.output.indexOf("\n", at)
		if (index === -1)
			return this.output.length

		while (this.output[--index] === "\r");
		return index + 1
	}

	getPosition (at = this.output.length): Omit<ChiriPosition, "file"> {
		return {
			line: this.getLineNumber(at) + 1,
			column: this.getColumnNumber(at) + 1,
		}
	}

	#lastLineNumber = 0
	#lastLineNumberPosition = 0
	getLineNumber (at = this.output.length) {
		const recalc = at < this.#lastLineNumberPosition
		if (recalc)
			console.warn(ansi.err + "Recalculating line number from start :(")

		let newlines = recalc ? 0 : this.#lastLineNumber
		let j = recalc ? 0 : this.#lastLineNumberPosition
		for (; j < at; j++)
			if (this.output[j] === "\n")
				newlines++

		if (!recalc) {
			this.#lastLineNumber = newlines
			this.#lastLineNumberPosition = at
		}

		return newlines
	}

	getColumnNumber (at = this.output.length - 1) {
		return at - this.getLineStart(at)
	}
}
