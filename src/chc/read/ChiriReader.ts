

import fsp from "fs/promises"
import path from "path"
import ansi from "../../ansi"
import { LIB_ROOT, PACKAGE_ROOT } from "../../constants"
import { ChiriType } from "../type/ChiriType"
import ChiriTypeManager from "../type/ChiriTypeManager"
import type TypeDefinition from "../type/TypeDefinition"
import Arrays from "../util/Arrays"
import Errors from "../util/Errors"
import relToCwd from "../util/relToCwd"
import Strings from "../util/Strings"
import type { ArrayOr, PromiseOr } from "../util/Type"
import type { ChiriContext, ChiriContextType, ResolveContextDataTuple } from "./consume/body/Contexts"
import consumeBlockEnd from "./consume/consumeBlockEnd"
import type { ChiriCompilerVariable } from "./consume/consumeCompilerVariableOptional"
import consumeDocumentationOptional, { type ChiriDocumentation } from "./consume/consumeDocumentationOptional"
import type { ChiriKeyframe } from "./consume/consumeKeyframe"
import type { ChiriMacroUse, MacroResult } from "./consume/consumeMacroUseOptional"
import consumeMacroUseOptional from "./consume/consumeMacroUseOptional"
import type { ChiriMixin } from "./consume/consumeMixinOptional"
import consumeMixinOptional from "./consume/consumeMixinOptional"
import consumeMixinUseOptional, { type ChiriMixinUse } from "./consume/consumeMixinUseOptional"
import consumeNewBlockLineOptional from "./consume/consumeNewBlockLineOptional"
import type { ChiriPropertyDefinition } from "./consume/consumePropertyOptional"
import consumePropertyOptional, { type ChiriProperty } from "./consume/consumePropertyOptional"
import type { ChiriValueText } from "./consume/consumeValueText"
import consumeWhiteSpaceOptional from "./consume/consumeWhiteSpaceOptional"
import type { ChiriWordInterpolated } from "./consume/consumeWordInterpolatedOptional"
import type { ChiriAfter } from "./consume/macro/macroAfter"
import type { ChiriAlias } from "./consume/macro/macroAlias"
import type { ChiriAnimate } from "./consume/macro/macroAnimate"
import type { ChiriAnimation } from "./consume/macro/macroAnimation"
import type { ChiriDo } from "./consume/macro/macroDo"
import type { ChiriEach } from "./consume/macro/macroEach"
import type { ChiriFontFace } from "./consume/macro/macroFontFace"
import type { ChiriFor } from "./consume/macro/macroFor"
import type { ChiriFunction } from "./consume/macro/macroFunctionDeclaration"
import type { ChiriElse, ChiriIf } from "./consume/macro/macroIf"
import type { ChiriCSSImport, ChiriImport } from "./consume/macro/macroImport"
import type { ChiriInclude } from "./consume/macro/macroInclude"
import type { ChiriMacro } from "./consume/macro/macroMacroDeclaration"
import type { ChiriReturn } from "./consume/macro/macroReturn"
import type { ChiriAssignment } from "./consume/macro/macroSet"
import type { ChiriShorthand } from "./consume/macro/macroShorthand"
import type { ChiriWhile } from "./consume/macro/macroWhile"
import consumeRuleMainOptional from "./consume/rule/consumeRuleMainOptional"
import consumeRulePseudoOptional from "./consume/rule/consumeRulePseudoOptional"
import consumeRuleStateOptional from "./consume/rule/consumeRuleStateOptional"
import type { ChiriComponent, ChiriComponentCustomState, ChiriComponentPseudo, ChiriComponentState, ChiriComponentViewTransition } from "./consume/rule/Rule"

export interface ChiriPosition {
	file: string
	line: number
	column: number
}

export type ChiriStatement =
	// all
	| ChiriDocumentation
	// macro
	| ChiriCompilerVariable
	| ChiriMacro
	| ChiriMacroUse
	| ChiriEach
	| ChiriDo
	| ChiriAssignment
	| ChiriFor
	| ChiriFunction
	| ChiriReturn
	| ChiriWhile
	| ChiriIf
	| ChiriElse
	| ChiriInclude
	| ChiriCSSImport
	| ChiriImport
	| ChiriAnimation
	| ChiriAnimate
	// root
	| ChiriComponent
	| ChiriMixin
	| ChiriShorthand
	| ChiriAlias
	| ChiriPropertyDefinition
	| ChiriFontFace
	// component/mixin
	| ChiriComponentCustomState
	| ChiriComponentState
	| ChiriComponentPseudo
	| ChiriComponentViewTransition
	| ChiriAfter
	| ChiriProperty
	| ChiriMixinUse
	// shorthand
	| ChiriWordInterpolated
	// animation
	| ChiriKeyframe
	// debug
	| ChiriValueText

type VerifyChiriStatement = ChiriStatement["position"]

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

	types = new ChiriTypeManager(this)

	#outerStatements: ChiriStatement[] = []
	#statements: ChiriStatement[] = []

	#errorStart?: number

	i = 0
	indent = 0
	#multiline = true
	#isSubReader = false
	#errored = false
	used: Set<string> = new Set()
	reusable: Set<string> = new Set()
	importName?: string

	readonly pipeValueStack: { type: ChiriType, used: boolean }[] = []

	readonly basename: string
	readonly dirname: string
	readonly cwd: string

	public get errored () {
		return this.#errored
	}

	public get isSubReader () {
		return this.#isSubReader
	}

	constructor (
		public readonly filename: string,
		public readonly input: string,
		cwd?: string,
		public readonly context: ChiriContext = { type: "root" },
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

	sub<CONTEXT extends ChiriContextType> (multiline: boolean, context: CONTEXT, ...data: ResolveContextDataTuple<CONTEXT>) {
		// this.logLine(undefined, `sub for ${context}`)
		const contextData = { type: context, data: data[0] } as ChiriContext
		const reader = new ChiriReader(this.filename, this.input, undefined, contextData, this.stack.slice(), this.source)
		reader.i = this.i
		reader.indent = this.indent
		reader.#multiline = multiline
		reader.#lastLineNumber = this.#lastLineNumber
		reader.#lastLineNumberPosition = this.#lastLineNumberPosition
		reader.#outerStatements = [...this.#outerStatements, ...this.#statements]
		reader.types = this.types.clone(reader)
		if (reader.context.type === "function")
			reader.types.registerGenerics(...reader.context.data.types)
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
		this.#errored ||= reader.#errored
	}

	getVariables (onlyThisBlock?: true) {
		return (onlyThisBlock ? this.#statements : [...this.#outerStatements, ...this.#statements])
			.filter((statement): statement is ChiriCompilerVariable => statement.type === "variable")
	}

	getVariableOptional (name: string) {
		return undefined
			?? this.#statements.findLast((statement): statement is ChiriCompilerVariable =>
				statement.type === "variable" && statement.name.value === name)
			?? this.#outerStatements.findLast((statement): statement is ChiriCompilerVariable =>
				statement.type === "variable" && statement.name.value === name)
	}

	getVariable (name: string, start = this.i) {
		const variable = this.getVariableOptional(name)
		if (!variable)
			throw this.error(start, `No variable "${name}" exists`)

		return variable
	}

	getFunctionOptional (name: string) {
		return undefined
			?? this.#statements.findLast((statement): statement is ChiriFunction =>
				statement.type === "function" && statement.name.value === name)
			?? this.#outerStatements.findLast((statement): statement is ChiriFunction =>
				statement.type === "function" && statement.name.value === name)
	}

	getFunction (name: string, start = this.i) {
		const fn = this.getFunctionOptional(name)
		if (!fn)
			throw this.error(start, `No function "${name}" exists`)

		return fn
	}

	getMacroOptional (name: string) {
		return undefined
			?? this.#statements.findLast((statement): statement is ChiriMacro =>
				statement.type === "macro" && statement.name.value === name)
			?? this.#outerStatements.findLast((statement): statement is ChiriMacro =>
				statement.type === "macro" && statement.name.value === name)
	}

	with (...scopeStatements: ChiriStatement[]) {
		return {
			do: async <T> (callback: () => PromiseOr<T>): Promise<T> => {
				this.#statements.push(...scopeStatements)
				try {
					return callback()
				} finally {
					this.#statements.splice(-scopeStatements.length, scopeStatements.length)
				}
			},
		}
	}

	getType (name: string | ChiriType) {
		name = typeof name === "string" ? name : name.name.value
		const type = this.types.types[name]
		if (!type)
			throw this.error(`There is no type by name "${name}"`)
		return type
	}

	getTypeOptional (name: string): TypeDefinition | undefined {
		return this.types.types[name]
	}

	getStatements (onlyThisBlock?: true): readonly ChiriStatement[] {
		return !onlyThisBlock ? [...this.#outerStatements, ...this.#statements] : this.#statements
	}

	setExport () {

	}

	async read (): Promise<ChiriAST>
	async read<STATEMENT = ChiriStatement> (consumer: ChiriBodyConsumer<STATEMENT>): Promise<ChiriAST<STATEMENT>>
	async read (configuredConsumer?: ChiriBodyConsumer<ChiriStatement>): Promise<ChiriAST<object>> {
		const consumer = async (): Promise<ArrayOr<ChiriStatement | undefined>> => {
			const macroResult = await consumeMacroUseOptional(this, (configuredConsumer ? undefined : this.#isSubReader ? "generic" : "root")!)
			if (!configuredConsumer)
				return this.consumeBodyDefault(macroResult)

			return macroResult ?? await configuredConsumer(this)
		}

		try {
			if (!this.#multiline) {
				consumeWhiteSpaceOptional(this)

				const e = this.i
				const consumed = await consumer()
				if (!consumed)
					throw this.error(e, `Expected ${this.context.type} content`)

				this.#statements.push(...Arrays.resolve(consumed).filter(Arrays.filterNullish))

			} else {
				do {
					// if (this.#errored)
					// 	break

					// this.logLine(undefined, this.stack.join(" -> "))
					const e = this.i
					const consumed = await consumer()
					if (!consumed)
						throw this.error(e, `Expected ${this.context.type} content`)

					this.#statements.push(...Arrays.resolve(consumed).filter(Arrays.filterNullish))
				} while (consumeNewBlockLineOptional(this))

				if (this.i < this.input.length)
					consumeBlockEnd(this)
			}

			if (!this.#isSubReader && this.i < this.input.length)
				throw this.error("Failed to continue parsing input file")

		} catch (err) {
			this.#errored = true
			if (!this.#subError)
				this.logLine(this.#errorStart, err as Error)
		}

		// this.logLine(undefined, `read end (${this.context})`)
		return {
			source: this.source,
			statements: this.#statements,
		}
	}

	async consumeBodyDefault (macro?: MacroResult): Promise<ChiriStatement | ChiriStatement[]> {
		////////////////////////////////////
		//#region Macro

		if (macro?.type === "import") {
			for (const imp of macro.paths) {
				const raw = (imp.module ? `${imp.module}:` : "") + imp.path
				const dirname = !imp.module ? this.dirname : imp.module === "chiri" ? LIB_ROOT : require.resolve(imp.module)
				const filename = imp.path.startsWith("/") ? path.join(this.cwd, imp.path) : path.resolve(dirname, imp.path)
				if (this.stack.includes(filename))
					throw this.error(`Cannot recursively import file "${raw}"`)

				let sub
				try {
					sub = await ChiriReader.load(filename, this)
					sub.importName = raw

				} catch (e) {
					const err = e as Error
					this.#errorStart = this.i
					this.i = imp.i
					const message = err.message?.includes("no such file") ? "does not exist" : (err.message ?? "unknown error")
					throw this.error(`Cannot import file "${raw}": ${message}`)
				}

				if (sub) {
					sub.#outerStatements = [...this.#outerStatements, ...this.#statements]
					const ast = await sub.read()
					// sub.logLine(undefined, `imp end (${sub.context})`)
					if (this.reusable.has(this.filename) && !this.reusable.has(sub.filename))
						throw this.error(imp.i, `${this.importName} is exported as reusable, it can only import other files exported as reusable`)

					this.#statements.push(...ast.statements)
					if (sub.errored)
						this.subError()
				}
			}

			return []
		}

		if (macro)
			return macro

		// if (macro)
		// 	throw this.error(e, `Macro result type "${(macro as MacroResult).type}" is not supported yet`)

		//#endregion
		////////////////////////////////////

		const documentation = consumeDocumentationOptional(this)
		if (documentation)
			// ignore documentation atm because it isn't set up right
			return []

		const mixin = await consumeMixinOptional(this)
		if (mixin)
			return mixin

		const mixinUse = consumeMixinUseOptional(this)
		if (mixinUse)
			return mixinUse

		const property = await consumePropertyOptional(this)
		if (property)
			return property

		const rule = this.context.type === "keyframe" ? undefined : (undefined
			?? (this.context.type === "state" || this.context.type === "pseudo" ? undefined : await consumeRuleMainOptional(this))
			?? (this.context.type === "pseudo" ? undefined : await consumeRuleStateOptional(this))
			?? await consumeRulePseudoOptional(this))
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
		const line = Strings.symbolise(this.getCurrentLine(undefined, true))

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
		return ansi.path + relToCwd(this.filename)
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

	consume<STRING extends string> (...strings: STRING[]) {
		NextString: for (const string of strings) {
			for (let j = 0; j < string.length; j++)
				if (this.input[this.i + j] !== string[j])
					continue NextString

			this.i += string.length
			return string
		}

		const expected = strings.map(string => string
			.replace(/\r/g, "\u240D")
			.replace(/\n/g, "\u240A")
			.replace(/ /g, "\u00B7")
			.replace(/\t/g, "\u2192"))
		throw this.error("Expected "
			+ (expected.length === 1 ? expected[0]
				: "any of " + expected.map(string => `"${string}"`).join(", ")))
	}

	consumeOptional<STRING extends string> (...strings: STRING[]) {
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
