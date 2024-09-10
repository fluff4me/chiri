

import fsp from "fs/promises"
import path from "path"
import ansi from "../../ansi"
import { LIB_ROOT } from "../../constants"
import type { ChiriAST, ChiriCompilerVariable, ChiriContext, ChiriMixin, ChiriPosition, ChiriStatement } from "../ChiriAST"
import relToCwd from "../util/relToCwd"
import type { ChiriTypeDefinition } from "./ChiriTypeManager"
import ChiriTypeManager from "./ChiriTypeManager"
import consumeBlockEnd from "./consume/consumeBlockEnd"
import consumeDocumentationOptional from "./consume/consumeDocumentationOptional"
import consumeMacroOptional from "./consume/consumeMacroUseOptional"
import consumeMixinOptional from "./consume/consumeMixinOptional"
import consumeMixinUseOptional from "./consume/consumeMixinUseOptional"
import consumeNewBlockLineOptional from "./consume/consumeNewBlockLineOptional"
import consumePropertyOptional from "./consume/consumePropertyOptional"
import consumeRuleMainOptional from "./consume/consumeRuleMainOptional"
import consumeRuleStateOptional from "./consume/consumeRuleStateOptional"

interface ChiriPositionState {
	lastLineNumber: number
	lastLineNumberPosition: number
	i: number
}

export default class ChiriReader {

	static async load (filename: string, cwd?: string, once?: Set<string>) {
		filename = path.resolve(filename)
		if (!filename.endsWith(".chiri"))
			filename += ".chiri"

		if (once?.has(filename))
			return undefined

		const ch = await fsp.readFile(filename, "utf8")
		return new ChiriReader(filename, ch, cwd)
	}

	types = new ChiriTypeManager()

	#outerStatements: ChiriStatement[] = []
	#statements: ChiriStatement[] = []
	#rootStatements: ChiriStatement[] = []

	#errorStart?: number

	i = 0
	indent = 0
	#multiline = true
	#isSubReader = false
	#errored = false
	once: Set<string> = new Set()

	public readonly basename: string
	public readonly dirname: string
	public readonly cwd: string

	constructor (
		public readonly filename: string,
		public readonly input: string,
		cwd?: string,
		public readonly context?: ChiriContext,
	) {
		this.basename = path.join(path.dirname(filename), path.basename(filename, path.extname(filename)))
		this.dirname = path.dirname(filename)
		this.cwd = cwd ?? this.dirname
	}

	setOnce () {
		this.once.add(this.filename)
		return true
	}

	sub (multiline: boolean, context: ChiriContext) {
		const reader = new ChiriReader(this.filename, this.input, undefined, context)
		reader.i = this.i
		reader.indent = this.indent
		reader.#multiline = multiline
		reader.#lastLineNumber = this.#lastLineNumber
		reader.#lastLineNumberPosition = this.#lastLineNumberPosition
		reader.#outerStatements = [...this.#outerStatements, ...this.#statements]
		reader.types = this.types.clone()
		reader.#isSubReader = true
		return reader
	}

	/**
	 * Update this reader to the position of the subreader
	 */
	update (reader: ChiriReader) {
		this.i = reader.i
		this.indent = reader.indent
		this.#errored = reader.#errored
	}

	getVariable (name: string) {
		return undefined
			?? this.#outerStatements.findLast((statement): statement is ChiriCompilerVariable =>
				statement.type === "variable" && statement.name.value === name)
			?? this.#statements.findLast((statement): statement is ChiriCompilerVariable =>
				statement.type === "variable" && statement.name.value === name)
	}

	getMixin (name: string) {
		return undefined
			?? this.#outerStatements.findLast((statement): statement is ChiriMixin =>
				statement.type === "mixin" && statement.name.value === name)
			?? this.#statements.findLast((statement): statement is ChiriMixin =>
				statement.type === "mixin" && statement.name.value === name)
	}

	getType (name: string) {
		const type = this.types.types[name]
		if (!type)
			throw this.error(`There is no type by name '${name}'`)
		return type
	}

	getTypeOptional (name: string): ChiriTypeDefinition | undefined {
		return this.types.types[name]
	}

	getUnaryOperators () {
		return this.types.unaryOperators
	}

	getBinaryOperators () {
		return this.types.binaryOperators
	}

	async read (): Promise<ChiriAST> {
		const source: Record<string, string> = {
			[this.filename]: this.input,
		}

		let ignoreNewLineRequirement = this.#isSubReader
		try {
			while (true) {
				if (this.#errored)
					break

				let e = this.i
				if (this.#multiline)
					while (consumeNewBlockLineOptional(this));

				if (this.i >= this.input.length)
					break

				if (this.i && this.i === e && this.#multiline && !ignoreNewLineRequirement) {
					if (consumeBlockEnd(this))
						break

					throw this.error("Expected newline")
				}

				ignoreNewLineRequirement = false

				const documentation = consumeDocumentationOptional(this)
				if (documentation)
					this.#statements.push(documentation)

				e = this.i

				////////////////////////////////////
				//#region Macro

				const macro = await consumeMacroOptional(this)
				if (macro?.type === "variable") {
					// if (macro.type === "variable")
					// 	this.#variables[macro.name.value] = this.#statements.length;
					this.#statements.push(macro)
					continue
				}

				if (macro?.type === "import") {
					for (const imp of macro.paths) {
						const dirname = !imp.module ? this.dirname : imp.module === "chiri" ? LIB_ROOT : require.resolve(imp.module)
						const filename = imp.path.startsWith("/") ? path.join(this.cwd, imp.path) : path.resolve(dirname, imp.path)
						if (source[filename])
							throw this.error(`Cannot recursively import file '${relToCwd(filename, this.cwd)}'`)

						let sub
						try {
							sub = await ChiriReader.load(filename, this.cwd, this.once)

						} catch (e) {
							const err = e as Error
							this.#errorStart = this.i
							this.i = imp.i
							const message = err.message?.includes("no such file") ? "does not exist" : (err.message ?? "unknown error")
							throw this.error(`Cannot import file '${relToCwd(filename, this.cwd)}': ${message}`)
						}

						if (sub) {
							sub.once = this.once
							const ast = await sub.read()

							this.#errored ||= sub.#errored
							Object.assign(source, ast.source)
							this.#statements.push(...ast.statements)
						}
					}

					continue
				}

				if (macro?.type === "function-use" || macro?.type === "function") {
					this.#statements.push(macro)
					continue
				}

				if (macro)
					throw this.error(e, "Not supported this macro result type yet")

				//#endregion
				////////////////////////////////////

				const mixin = await consumeMixinOptional(this)
				if (mixin) {
					// this.#variables[mixin.name.value] = this.#statements.length;
					this.#statements.push(mixin)
					continue
				}

				const mixinUse = consumeMixinUseOptional(this)
				if (mixinUse) {
					this.#statements.push(mixinUse)
					continue
				}

				const property = consumePropertyOptional(this)
				if (property) {
					const statementsContainer = this.#isSubReader ? this.#statements : this.#rootStatements
					statementsContainer.push(property)
					continue
				}

				const rule = (await consumeRuleMainOptional(this)) || (await consumeRuleStateOptional(this))
				if (rule) {
					this.#statements.push(rule)
					continue
				}

				if (this.#errored)
					break

				if (!this.#multiline)
					break

				if (this.i === e)
					throw this.error("Failed to continue parsing")
			}

		} catch (err) {
			this.#errored = true
			this.logLine(this.#errorStart, err as Error)
		}

		if (this.#rootStatements.length) {
			this.#statements.unshift({
				type: "root",
				content: this.#rootStatements,
			})
		}

		return {
			source,
			statements: this.#statements,
		}
	}

	logLine (start?: number, errOrMessage?: Error | string) {
		const line = this.getCurrentLine(undefined, true)
			.replace(/\r/g, ansi.whitespace + "\u240D" + ansi.reset)
			.replace(/\n/g, ansi.whitespace + "\u240A" + ansi.reset)
			.replace(/ /g, ansi.whitespace + "\u00B7" + ansi.reset)
			.replace(/\t/g, ansi.whitespace + "\u2192" + ansi.reset)

		const lineNumber = this.getLineNumber()
		const columnNumber = this.getColumnNumber()

		const err = typeof errOrMessage === "string" ? undefined : errOrMessage
		const message = typeof errOrMessage === "string" ? errOrMessage : undefined

		const filename = this.formatFilePos(lineNumber, columnNumber)
		console[err ? "error" : "info"](filename
			+ ansi.label + (errOrMessage ? " - " : "")
			+ ansi.reset + (!err ? message ?? "" : ansi.err + err.message) + "\n"
			+ ansi.label + "  " + `${lineNumber + 1}`.padStart(5) + " " + ansi.reset + line + "\n"
			+ (err ? ansi.err : ansi.filepos) + `        ${" ".repeat(columnNumber)}${"^".repeat((start ?? this.i) - this.i || 1)}`
			+ ansi.reset
			+ (!err?.stack ? ""
				: `\n${err.stack.slice(err.stack.indexOf("\n", start === undefined ? 0 : err.stack.indexOf("\n") + 1) + 1)}`))
	}

	formatFilename () {
		return ansi.path + path.relative(process.cwd(), this.filename).replaceAll("\\", "/")
	}

	formatFilePos (lineNumber = this.getLineNumber(), columnNumber = this.getColumnNumber()) {
		return this.formatFilename() + ansi.filepos + `:${lineNumber + 1}:${columnNumber + 1}` + ansi.reset
	}

	formatFilePosAt (at = this.i) {
		return this.formatFilePos(this.getLineNumber(at), this.getColumnNumber(at))
	}

	consume (...strings: string[]) {
		NextString: for (const string of strings) {
			for (let j = 0; j < string.length; j++)
				if (this.input[this.i + j] !== string[j])
					continue NextString

			this.i += string.length
			return string
		}

		strings = strings.map(string => string
			.replace(/\r/g, "\u240D")
			.replace(/\n/g, "\u240A")
			.replace(/ /g, "\u00B7")
			.replace(/\t/g, "\u2192"))
		throw this.error("Expected "
			+ (strings.length === 1 ? strings[0]
				: "any of" + strings.map(string => `'${string}'`).join(", ")))
	}

	consumeOptional (...strings: string[]) {
		NextString: for (const string of strings) {
			for (let j = 0; j < string.length; j++)
				if (this.input[this.i + j] !== string[j])
					continue NextString

			this.i += string.length
			return string
		}

		return undefined
	}

	/**
	 * @param  {...string} strings 
	 */
	consumeUntil (...strings: string[]) {
		let consumed = ""
		for (; this.i < this.input.length; this.i++) {
			if (this.peek(...strings))
				break

			consumed += this.input[this.i]
		}

		return consumed
	}

	peek (...strings: string[]) {
		NextString: for (const string of strings) {
			for (let j = 0; j < string.length; j++)
				if (this.input[this.i + j] !== string[j])
					continue NextString

			return string
		}

		return undefined
	}

	error (message: string): Error
	error (errorPosition: number, message: string): Error
	error (errorPositionOrMessage: number | string, message?: string) {
		this.#errorStart = this.i
		if (typeof errorPositionOrMessage === "number")
			this.i = errorPositionOrMessage
		else
			message = errorPositionOrMessage

		return new Error(message ?? "Compilation failed for an unknown reason")
	}

	getLineStart (at = this.i) {
		return this.input.lastIndexOf("\n", at - 1) + 1
	}

	getLineEnd (at = this.i, includeNewline = false) {
		let index = this.input.indexOf("\n", at)
		if (index === -1)
			return this.input.length

		if (!includeNewline)
			while (this.input[--index] === "\r");
		return index + 1
	}

	savePosition (): ChiriPositionState {
		return {
			i: this.i,
			lastLineNumber: this.#lastLineNumber,
			lastLineNumberPosition: this.#lastLineNumberPosition,
		}
	}

	restorePosition (state: ChiriPositionState) {
		this.#lastLineNumberPosition = state.lastLineNumberPosition
		this.#lastLineNumber = state.lastLineNumber
		this.i = state.i
	}

	getPosition (at = this.i): ChiriPosition {
		return {
			file: this.filename,
			line: this.getLineNumber(at) + 1,
			column: this.getColumnNumber(at) + 1,
		}
	}

	#lastLineNumber = 0
	#lastLineNumberPosition = 0
	getLineNumber (at = this.i) {
		const lastLineNumberPosition = this.#lastLineNumberPosition
		const recalc = at < lastLineNumberPosition

		const lastPos = !recalc ? "" : this.formatFilePosAt(lastLineNumberPosition)

		let newlines = recalc ? 0 : this.#lastLineNumber
		let j = recalc ? 0 : lastLineNumberPosition
		for (; j < at; j++)
			if (this.input[j] === "\n")
				newlines++

		this.#lastLineNumber = newlines
		this.#lastLineNumberPosition = at

		if (recalc) {
			const newPos = this.formatFilePos()
			const stack = new Error().stack
			console.warn(`${ansi.err}Forced to recalculate line number! ${ansi.label}Was: ${lastPos} ${ansi.label}Now: ${newPos}${ansi.reset}\n${stack?.slice(stack.indexOf("\n", stack.indexOf("\n") + 1) + 1)}`)
		}

		return newlines
	}

	getColumnNumber (at = this.i) {
		return at - this.getLineStart(at)
	}

	getCurrentLine (at = this.i, includeNewline = false) {
		return this.input.slice(this.getLineStart(at), this.getLineEnd(at, includeNewline))
	}

	isWordChar = (charCode = this.input.charCodeAt(this.i)) => false
		|| charCode === 45 // -
		|| this.isLetter(charCode)
		|| this.isDigit(charCode)

	isLetter = (charCode = this.input.charCodeAt(this.i)) => false
		|| (charCode >= 65 && charCode <= 90) // A-Z
		|| (charCode >= 97 && charCode <= 122) // a-z

	isDigit = (charCode = this.input.charCodeAt(this.i)) => false
		|| (charCode >= 48 && charCode <= 57) // 0-9
}
