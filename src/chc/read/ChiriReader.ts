

import fsp from "fs/promises"
import path from "path"
import ansi from "../../ansi"
import { LIB_ROOT, PACKAGE_ROOT } from "../../constants"
import Arrays from "../util/Arrays"
import Errors from "../util/Errors"
import type { ArrayOr, PromiseOr } from "../util/Type"
import { ChiriType } from "./ChiriType"
import type { ChiriTypeDefinition } from "./ChiriTypeManager"
import ChiriTypeManager from "./ChiriTypeManager"
import type { ChiriContext } from "./consume/body/Contexts"
import consumeBlockEnd from "./consume/consumeBlockEnd"
import type { ChiriCompilerVariable } from "./consume/consumeCompilerVariableOptional"
import consumeDocumentationOptional, { type ChiriDocumentation } from "./consume/consumeDocumentationOptional"
import type { ChiriFunctionUse } from "./consume/consumeFunctionUseOptional"
import { default as consumeMacroOptional, default as consumeMacroUseOptional } from "./consume/consumeMacroUseOptional"
import type { ChiriMixin } from "./consume/consumeMixinOptional"
import consumeMixinOptional from "./consume/consumeMixinOptional"
import consumeMixinUseOptional, { type ChiriMixinUse } from "./consume/consumeMixinUseOptional"
import consumeNewBlockLineOptional from "./consume/consumeNewBlockLineOptional"
import consumePropertyOptional, { type ChiriProperty } from "./consume/consumePropertyOptional"
import consumeWhiteSpaceOptional from "./consume/consumeWhiteSpaceOptional"
import type { ChiriEach } from "./consume/macro/macroEach"
import type { ChiriFunction } from "./consume/macro/macroFunctionDeclaration"
import type { ChiriShorthand } from "./consume/macro/macroShorthand"
import consumeRuleMainOptional from "./consume/rule/consumeRuleMainOptional"
import consumeRuleStateOptional from "./consume/rule/consumeRuleStateOptional"
import type { ChiriRule } from "./consume/rule/Rule"

export interface ChiriPosition {
	file: string
	line: number
	column: number
}

export interface ChiriRoot {
	type: "root"
	content: ChiriStatement[]
}

export type ChiriStatement =
	| ChiriCompilerVariable
	| ChiriProperty
	| ChiriMixin
	| ChiriFunction
	| ChiriDocumentation
	| ChiriRule
	| ChiriMixinUse
	| ChiriFunctionUse
	| ChiriRoot
	| ChiriShorthand
	| ChiriEach

export interface ChiriAST<STATEMENT = ChiriStatement> {
	source: Record<string, string>
	statements: STATEMENT[]
}

export interface ChiriPositionState {
	lastLineNumber: number
	lastLineNumberPosition: number
	i: number
}

export type ChiriBodyConsumer<T> = (reader: ChiriReader) => PromiseOr<ArrayOr<T | undefined>>

export default class ChiriReader {

	static async load (filename: string, reader?: ChiriReader) {
		filename = path.resolve(filename)
		if (!filename.endsWith(".chiri"))
			filename += ".chiri"

		if (reader?.used.has(filename) && !reader.reusable.has(filename))
			throw reader.error("This source file is not exported as reusable")


		const ch = await fsp.readFile(filename, "utf8")
		const result = new ChiriReader(filename, ch, reader?.cwd, undefined, reader?.stack.slice(), reader?.source)
		result.used = reader?.used ?? result.used
		result.reusable = reader?.reusable ?? result.reusable
		result.used.add(filename)
		return result
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
	used: Set<string> = new Set()
	reusable: Set<string> = new Set()
	importName?: string

	public readonly basename: string
	public readonly dirname: string
	public readonly cwd: string

	public get errored () {
		return this.#errored
	}

	constructor (
		public readonly filename: string,
		public readonly input: string,
		cwd?: string,
		public readonly context: ChiriContext = "root",
		public readonly stack: string[] = [],
		public readonly source: Record<string, string> = {},
	) {
		this.basename = path.join(path.dirname(filename), path.basename(filename, path.extname(filename)))
		this.dirname = path.dirname(filename)
		this.cwd = cwd ?? this.dirname
		this.stack.push(filename)
		this.source[filename] = this.input
		this.consumeBodyDefault = this.consumeBodyDefault.bind(this)
	}

	setReusable () {
		this.reusable.add(this.filename)
		return true
	}

	sub (multiline: boolean, context: ChiriContext) {
		// this.logLine(undefined, `sub for ${context}`)
		const reader = new ChiriReader(this.filename, this.input, undefined, context, this.stack.slice(), this.source)
		reader.i = this.i
		reader.indent = this.indent
		reader.#multiline = multiline
		reader.#lastLineNumber = this.#lastLineNumber
		reader.#lastLineNumberPosition = this.#lastLineNumberPosition
		reader.#outerStatements = [...this.#outerStatements, ...this.#statements]
		reader.types = this.types.clone()
		reader.used = this.used
		reader.reusable = this.reusable
		reader.#isSubReader = true
		return reader
	}

	addOuterStatement (statement: ChiriStatement) {
		this.#outerStatements.push(statement)
		return this
	}

	/**
	 * Update this reader to the position of the subreader
	 */
	update (reader: ChiriReader) {
		this.i = reader.i
		this.indent = reader.indent
		this.#errored = reader.#errored
	}

	getVariables () {
		return [...this.#outerStatements, ...this.#statements]
			.filter((statement): statement is ChiriCompilerVariable => statement.type === "variable")
	}

	getVariable (name: string) {
		return undefined
			?? this.#statements.findLast((statement): statement is ChiriCompilerVariable =>
				statement.type === "variable" && statement.name.value === name)
			?? this.#outerStatements.findLast((statement): statement is ChiriCompilerVariable =>
				statement.type === "variable" && statement.name.value === name)
	}

	getFunction (name: string) {
		return undefined
			?? this.#statements.findLast((statement): statement is ChiriFunction =>
				statement.type === "function" && statement.name.value === name)
			?? this.#outerStatements.findLast((statement): statement is ChiriFunction =>
				statement.type === "function" && statement.name.value === name)
	}

	getMixin (name: string) {
		return undefined
			?? this.#statements.findLast((statement): statement is ChiriMixin =>
				statement.type === "mixin" && statement.name.value === name)
			?? this.#outerStatements.findLast((statement): statement is ChiriMixin =>
				statement.type === "mixin" && statement.name.value === name)
	}

	getType (name: string | ChiriType) {
		name = typeof name === "string" ? name : name.name.value
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

	hasStatements () {
		return !!this.#statements.length
	}

	setExport () {

	}

	async read (): Promise<ChiriAST>
	async read<STATEMENT = ChiriStatement> (consumer: ChiriBodyConsumer<STATEMENT>): Promise<ChiriAST<STATEMENT>>
	async read (configuredConsumer: ChiriBodyConsumer<object> = this.consumeBodyDefault): Promise<ChiriAST<object>> {
		const consumer = async () => undefined
			?? await configuredConsumer(this)
			?? await consumeMacroUseOptional(this, this.context)

		try {
			if (!this.#multiline) {
				consumeWhiteSpaceOptional(this)

				const e = this.i
				const consumed = await consumer()
				if (!consumed)
					throw this.error(e, `Expected ${this.context} content`)

				this.#statements.push(...Arrays.resolve(consumed).filter(Arrays.filterNullish) as ChiriStatement[])

			} else {
				do {
					// if (this.#errored)
					// 	break

					// this.logLine(undefined, this.stack.join(" -> "))
					const e = this.i
					const consumed = await consumer()
					if (!consumed)
						throw this.error(e, `Expected ${this.context} content`)

					this.#statements.push(...Arrays.resolve(consumed).filter(Arrays.filterNullish) as ChiriStatement[])
				} while (consumeNewBlockLineOptional(this))

				if (this.i < this.input.length)
					consumeBlockEnd(this)
			}

		} catch (err) {
			this.#errored = true
			if (!this.#subError)
				this.logLine(this.#errorStart, err as Error)
		}

		if (this.#rootStatements.length) {
			this.#statements.unshift({
				type: "root",
				content: this.#rootStatements,
			})
		}

		return {
			source: this.source,
			statements: this.#statements,
		}
	}

	async consumeBodyDefault (): Promise<ChiriStatement | ChiriStatement[]> {
		const documentation = consumeDocumentationOptional(this)
		if (documentation)
			return documentation

		const e = this.i

		////////////////////////////////////
		//#region Macro

		const macro = await consumeMacroOptional(this, this.#isSubReader ? "generic" : "root")
		if (macro?.type === "variable")
			return macro

		if (macro?.type === "import") {
			const statements: ChiriStatement[] = []
			for (const imp of macro.paths) {
				const raw = (imp.module ? `${imp.module}:` : "") + imp.path
				const dirname = !imp.module ? this.dirname : imp.module === "chiri" ? LIB_ROOT : require.resolve(imp.module)
				const filename = imp.path.startsWith("/") ? path.join(this.cwd, imp.path) : path.resolve(dirname, imp.path)
				if (this.stack.includes(filename))
					throw this.error(`Cannot recursively import file '${raw}'`)

				let sub
				try {
					sub = await ChiriReader.load(filename, this)
					sub.importName = raw

				} catch (e) {
					const err = e as Error
					this.#errorStart = this.i
					this.i = imp.i
					const message = err.message?.includes("no such file") ? "does not exist" : (err.message ?? "unknown error")
					throw this.error(`Cannot import file '${raw}': ${message}`)
				}

				if (sub) {
					const ast = await sub.read()
					if (this.reusable.has(this.filename) && !this.reusable.has(sub.filename))
						throw this.error(imp.i, `${this.importName} is exported as reusable, it can only import other files exported as reusable`)

					this.#errored ||= sub.#errored
					statements.push(...ast.statements)
				}
			}

			return statements
		}

		if (macro && (macro.type === "function-use" || macro.type === "function" || macro.type === "shorthand")) {
			return macro
		}

		if (macro)
			throw this.error(e, `Macro result type "${macro.type}" is not supported yet`)

		//#endregion
		////////////////////////////////////

		const mixin = await consumeMixinOptional(this)
		if (mixin)
			return mixin

		const mixinUse = consumeMixinUseOptional(this)
		if (mixinUse)
			return mixinUse

		const property = consumePropertyOptional(this)
		if (property) {
			if (!this.#isSubReader) {
				this.#rootStatements.push(property)
				return []
			}

			return property
		}

		const rule = (await consumeRuleMainOptional(this)) || (await consumeRuleStateOptional(this))
		if (rule)
			return rule

		return []
	}

	logState () {
		console.log(Object.entries({
			variables: [...this.#outerStatements, ...this.#statements].filter(statement => statement.type === "variable")
				.map(statement => `${ansi.path + statement.name.value}: ${ansi.ok + ChiriType.stringify(statement.valueType)}`).join(ansi.label + ", "),
		}).map(([k, v]) => `${ansi.label + k}: ${v}` + ansi.reset).join("\n"))
	}

	logLine (start?: number, errOrMessage?: Error | string) {
		const line = this.getCurrentLine(undefined, true)
			.replace(/\r/g, ansi.whitespace + "\u240D" + ansi.reset)
			.replace(/\n/g, ansi.whitespace + "\u240A" + ansi.reset)
			.replace(/ /g, ansi.whitespace + "\u00B7" + ansi.reset)
			.replace(/\t/g, ansi.whitespace + "\u2192" + ansi.reset)

		const lineNumber = this.getLineNumber(undefined, true)
		const columnNumber = this.getColumnNumber()

		const err = typeof errOrMessage === "string" ? undefined : errOrMessage
		const message = typeof errOrMessage === "string" ? errOrMessage : undefined

		const filename = this.formatFilePosAtFromScratch(this.i)
		console[err ? "error" : "info"](filename
			+ ansi.label + (errOrMessage ? " - " : "")
			+ ansi.reset + (!err ? message ?? "" : ansi.err + err.message) + "\n"
			+ ansi.label + "  " + `${lineNumber + 1}`.padStart(5) + " " + ansi.reset + line + "\n"
			+ (err ? ansi.err : ansi.filepos) + `        ${" ".repeat(columnNumber)}${"^".repeat((start ?? this.i) - this.i || 1)}`
			+ ansi.reset
			+ (!err?.stack || (process.env.CHIRI_ENV !== "dev" && !(+process.env.CHIRI_STACK_LENGTH! || 0)) ? ""
				: `\n${err.stack
					.slice(err.stack.indexOf("\n", start === undefined ? 0 : err.stack.indexOf("\n") + 1) + 1)
					.split("\n")
					.slice(0, +process.env.CHIRI_STACK_LENGTH! || 3)
					.map(path => path.replace(PACKAGE_ROOT + "\\", "").replaceAll("\\", "/"))
					.join("\n")}`))
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

	formatFilePosAtFromScratch (at: number) {
		let newlines = 0
		let columns = 0
		for (let j = 0; j < at; j++) {
			if (this.input[j] === "\n") {
				newlines++
				columns = 0
				continue
			}

			columns++
		}

		return this.formatFilePos(newlines, columns)
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

	#subError = false
	subError () {
		this.#subError = true
		throw new Error("if this is logged something is very wrong")
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
	getLineNumber (at = this.i, allowRecalc = false) {
		const lastLineNumberPosition = this.#lastLineNumberPosition
		const recalc = at < lastLineNumberPosition

		let newlines = recalc ? 0 : this.#lastLineNumber
		let j = recalc ? 0 : lastLineNumberPosition
		for (; j < at; j++)
			if (this.input[j] === "\n")
				newlines++

		this.#lastLineNumber = newlines
		this.#lastLineNumberPosition = at

		if (recalc && !allowRecalc) {
			const lastPos = this.formatFilePosAtFromScratch(lastLineNumberPosition)
			const newPos = this.formatFilePosAtFromScratch(at)
			console.warn(`${ansi.err}Forced to recalculate line number! ${ansi.label}Was: ${lastPos} ${ansi.label}Now: ${newPos}${ansi.reset}\n${Errors.stack(3)}`)
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
