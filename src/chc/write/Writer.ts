import fsp from "fs/promises"
import path from "path"
import { SourceMapGenerator } from "source-map"
import ansi from "../../ansi"
import args from "../../args"
import type { ChiriAST, ChiriPosition } from "../read/ChiriReader"
import type { ChiriDocumentation } from "../read/consume/consumeDocumentationOptional"
import type { ChiriBaseText } from "../read/consume/consumeValueText"
import type { ChiriWord } from "../read/consume/consumeWord"
import relToCwd from "../util/relToCwd"
import stringifyText from "../util/stringifyText"
import type ChiriCompiler from "./ChiriCompiler"

export interface QueuedWrite {
	output: string
	mapping?: {
		sourcePosition: ChiriPosition
		tokenName?: string | undefined
	}
}

export namespace QueuedWrite {
	export function makeQueue (): QueuedWrite[] {
		return [{ output: "" }]
	}
}

export default class Writer {

	public static writeBlocks (writers: Writer[], inside: () => any) {
		writeBlocksRecursive()

		function writeBlocksRecursive () {
			const writer = writers.pop()
			if (!writer)
				return inside()

			writer.writeBlock(writeBlocksRecursive)
		}
	}

	#indent = 0

	public readonly dest: string
	private output = ""
	protected outputQueue = QueuedWrite.makeQueue()

	public readonly map: SourceMapGenerator

	protected get queue () {
		return this.outputQueue
	}

	protected get currentWrite () {
		return this.queue.at(-1)!
	}

	constructor (ast: ChiriAST, dest: string, public readonly config: ChiriWriteConfig) {
		this.dest = this.createDestPath(relToCwd(dest)) + config.extension

		this.map = new SourceMapGenerator({ file: this.dest })
		for (const [filename, source] of Object.entries(ast.source))
			this.map.setSourceContent(filename, source)
	}

	createDestPath (outFile: string): string {
		if (typeof args.out === "string")
			outFile = path.join(args.out, outFile)
		return path.resolve(outFile)
	}

	indent (amount = 1) {
		this.#indent += amount
	}

	unindent (amount = 1) {
		this.#indent -= amount
		for (let i = 0; i < amount; i++)
			if (this.currentWrite.output.at(-1) === "\t")
				this.currentWrite.output = this.currentWrite.output.slice(0, -1)
	}

	async writeFile () {
		this.output = ""
		for (const queued of this.queue) {
			if (queued.mapping && queued.mapping.sourcePosition.file !== "internal") {
				this.map.addMapping({
					generated: this.getPosition(),
					source: queued.mapping.sourcePosition.file,
					original: queued.mapping.sourcePosition,
					name: queued.mapping.tokenName,
				})
			}

			this.output += queued.output
		}

		await fsp.mkdir(path.dirname(this.dest), { recursive: true })
		return fsp.writeFile(this.dest, this.output)
	}

	write (text: string) {
		this.currentWrite.output += text
	}

	writeLine (text: string) {
		this.currentWrite.output += text
		this.writeNewLine()
	}

	writeLineStartBlock (text: string) {
		this.currentWrite.output += text
		this.indent()
		this.writeNewLine()
	}

	writeLineEndBlock (text: string) {
		this.unindent()
		this.currentWrite.output += text
		this.writeNewLine()
	}

	writeTextInterpolated (compiler: ChiriCompiler, source: ChiriBaseText) {
		this.addMapping(stringifyText(compiler, source), source.position)
	}

	writeWord (source: ChiriWord) {
		this.addMapping(source.value, source.position, source.value)
	}

	writeNewLine () {
		this.currentWrite.output += "\n" + "\t".repeat(this.#indent)
	}

	getNewLineOptional () {
		return "\n" + "\t".repeat(this.#indent)
	}

	getSpaceOptional () {
		return " "
	}

	writeNewLineOptional () {
		this.currentWrite.output += this.getNewLineOptional()
	}

	writeSpaceOptional () {
		this.currentWrite.output += this.getSpaceOptional()
	}

	writeBlock (inside: () => any) {
		const startIndex = this.currentWrite.output.length
		this.indent()
		this.writeLine("{")
		const currentWrite = this.currentWrite
		const insideStartIndex = this.currentWrite.output.length
		inside()
		if (currentWrite === this.currentWrite && this.currentWrite.output.length === insideStartIndex) {
			this.currentWrite.output = this.currentWrite.output.slice(0, startIndex)
			this.write("{}")
			this.#indent--
			return
		}

		this.unindent()
		this.writeLine("}")
	}

	writeDocumentation (documentation: ChiriDocumentation) {
		this.writeLine("/**")
		const lines = documentation.content.split("\n")
		for (const line of lines)
			this.writeLine(` * ${line}`)
		this.writeLine(" */")
	}

	onCompileStart (compiler: ChiriCompiler) { }
	onCompileEnd (compiler: ChiriCompiler) { }

	private addMapping (output: string, sourcePosition: ChiriPosition, tokenName?: string | undefined) {
		this.queue.push({
			output,
			mapping: {
				sourcePosition,
				tokenName,
			},
		})
		this.queue.push({ output: "" })
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
export interface ChiriWriteConfig {
	extension: `.${string}`
}

