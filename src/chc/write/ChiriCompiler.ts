import path from "path"
import ansi from "../../ansi"
import { PACKAGE_ROOT } from "../../constants"
import type { ChiriAST, ChiriPosition, ChiriStatement } from "../read/ChiriReader"
import { ChiriType } from "../read/ChiriType"
import type { ChiriExpressionOperand } from "../read/consume/consumeExpression"
import type { ChiriMixin } from "../read/consume/consumeMixinOptional"
import type { ChiriWordInterpolated } from "../read/consume/consumeWordInterpolatedOptional"
import type { ChiriFunction } from "../read/consume/macro/macroFunctionDeclaration"
import resolveExpression from "../util/resolveExpression"
import stringifyText from "../util/stringifyText"
import type { ArrayOr } from "../util/Type"
import CSSWriter from "./CSSWriter"
import DTSWriter from "./DTSWriter"
import ESWriter from "./ESWriter"
import type Writer from "./Writer"

////////////////////////////////////
//#region Scope

interface Scope {
	variables: Record<string, string | number | boolean | undefined>
	functions: Record<string, ChiriFunction>
	mixins: Record<string, ChiriMixin>
	shorthands: Record<string, string[]>
}

function Scope (data: Partial<Scope>): Partial<Scope> {
	return data
}

namespace Scope {
	export function variables (variables: Scope["variables"]): Partial<Scope> {
		return { variables }
	}
	export function mixins (mixins: Scope["mixins"]): Partial<Scope> {
		return { mixins }
	}
}

//#endregion
////////////////////////////////////

interface ErrorPositioned extends Error {
	position?: ChiriPosition
}

interface EmittedMixinClass {
	className: string
	affects: string[]
}

interface ChiriCompiler {
	ast: ChiriAST
	readonly css: CSSWriter
	readonly es: ESWriter
	readonly dts: DTSWriter
	readonly writers: readonly Writer[]

	compile (): void
	writeFiles (): Promise<void>
	error (position?: ChiriPosition, message?: string): ErrorPositioned
	logLine (position?: ChiriPosition, message?: string | ErrorPositioned): void

	getVariable (name: string): string | number | boolean | undefined
}

function ChiriCompiler (ast: ChiriAST, dest: string): ChiriCompiler {
	const scopes: Scope[] = []
	const selectorStack: ChiriWordInterpolated[] = []
	const emittedMixinClasses: EmittedMixinClass[] = []

	const css = new CSSWriter(ast, dest)
	const es = new ESWriter(ast, dest)
	const dts = new DTSWriter(ast, dest)
	const writers = [css, es, dts]

	const compiler: ChiriCompiler = {
		ast,
		css,
		es,
		dts,
		writers,

		writeFiles,
		compile,
		error,
		logLine,

		getVariable,
	}

	return compiler

	function getVariable (name: string) {
		return scope().variables[name]
	}

	async function writeFiles () {
		return Promise.all(writers.map(writer => writer.writeFile())) as Promise<any>
	}

	////////////////////////////////////
	//#region Public Utils

	function error (position?: ChiriPosition, message?: string): ErrorPositioned {
		return Object.assign(new Error(message ?? "Compilation failed for an unknown reason"), { position })
	}

	function logLine (position?: ChiriPosition, message?: string | ErrorPositioned, stack = true, preview = true) {
		const err = message instanceof Error ? message : undefined
		if (message instanceof Error) {
			position ??= message.position
			message = ansi.err + message.message + ansi.reset
		}

		message ??= ""

		const line = !position?.file ? "" : getLine(ast.source[position.file] ?? "", position.line - 1)
			.replace(/\r/g, ansi.whitespace + "\u240D" + ansi.reset)
			.replace(/\n/g, ansi.whitespace + "\u240A" + ansi.reset)
			.replace(/ /g, ansi.whitespace + "\u00B7" + ansi.reset)
			.replace(/\t/g, ansi.whitespace + "\u2192" + ansi.reset)

		const positionBlock = !position || !preview ? "" : "\n"
			+ ansi.label + "  " + `${position.line}`.padStart(5) + " " + ansi.reset + line + "\n"
			+ (err ? ansi.err : ansi.filepos) + `        ${" ".repeat(position.column - 1)}${"^"}`
			+ ansi.reset

		const filename = !position?.file ? "Unknown location"
			: ansi.path + path.relative(process.cwd(), position.file).replaceAll("\\", "/")
			+ ansi.filepos + `:${position.line}:${position.column}` + ansi.reset
		console[err ? "error" : "info"](filename
			+ ansi.label + (message ? " - " : "")
			+ ansi.reset + message
			+ positionBlock
			+ (!stack || !err?.stack || (process.env.CHIRI_ENV !== "dev" && !(+process.env.CHIRI_STACK_LENGTH! || 0)) ? ""
				: `\n${err.stack
					.slice(err.stack.indexOf("\n", err.stack.indexOf("\n") + 1) + 1)
					.split("\n")
					.slice(0, +process.env.CHIRI_STACK_LENGTH! || 3)
					.map(path => path.replace(PACKAGE_ROOT + "\\", "").replaceAll("\\", "/"))
					.join("\n")}`))
	}

	//#endregion
	////////////////////////////////////

	function compile () {
		try {
			for (const writer of writers)
				writer.onCompileStart(compiler)

			compileStatements(ast.statements, undefined, statement => false
				|| compileMacros(statement)
				|| compileRoot(statement)
				|| undefined)

			for (const writer of writers)
				writer.onCompileEnd(compiler)

		} catch (err) {
			logLine(undefined, err as ErrorPositioned)
		}
	}

	////////////////////////////////////
	//#region Contexts


	////////////////////////////////////
	//#region Context: Root

	function compileRoot (statement: ChiriStatement) {
		switch (statement.type) {
			case "documentation":
				for (const writer of writers)
					writer.writeDocumentation(statement)
				return true

			case "mixin":
				scope().mixins[statement.name.value] = statement
				return true

			case "shorthand":
				compileStatements(statement.body, undefined, compileShorthand)
				return true

			case "mixin-use": {
				const mixin = scope().mixins[statement.name.value]
				const assignments = resolveAssignments(statement.assignments)

				// this.compileStatements(mixin.content, assignments)
				return true
			}
			case "rule": {
				const className = statement.className?.content ?? []
				const state = statement.state

				const containingSelector = selectorStack[selectorStack.length - 1]

				const selector: ChiriWordInterpolated = !className.length ? containingSelector : {
					type: "text",
					valueType: ChiriType.of("string"),
					content: !containingSelector ? className : [...containingSelector?.content ?? [], "-", ...className],
					position: (statement.className?.position ?? statement.state?.position)!,
				}
				selectorStack.push(selector)

				compileStatements

				selectorStack.pop()
				return true
			}
			case "property":
				if (statement.isCustomProperty) css.write("--")
				css.writeTextInterpolated(compiler, statement.property)
				css.write(":")
				css.writeSpaceOptional()
				css.writeTextInterpolated(compiler, statement.value)
				css.writeLine(";")
				return true
			case "root":
				css.indent()
				css.writeLine(":root{")

				// this.compileStatements(statement.content,)

				css.unindent()
				css.writeLine("}")
				return true
		}
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Context: Macros

	function compileMacros (statement: ChiriStatement) {
		switch (statement.type) {
			case "variable":
				scope().variables[statement.name.value] = resolveExpression(compiler, statement.expression)
				return true

			case "function":
				scope().functions[statement.name.value] = statement
				return true

			case "function-use":
				switch (statement.name.value) {
					case "debug": {
						const lines = compileStatements(statement.content, undefined, statement => {
							const result = compileMacros(statement)
							if (result === true)
								return []

							if (result)
								throw error(statement.position, `Unhandled result type for ${debugStatementString(statement)}`)

							if (statement.type !== "text")
								throw error(statement.position, `Expected text, got ${debugStatementString(statement)}`)

							return stringifyText(compiler, statement)
						})
						logLine(statement.position, ansi.label + "debug" + (lines.length === 1 ? " - " : "") + ansi.reset + (lines.length <= 1 ? "" : "\n") + lines.join("\n"), false, false)
						return true
					}
				}
		}
	}

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Context: Shorthand

	function compileShorthand (statement: ChiriStatement): ArrayOr<string> | undefined {
		if (compileMacros(statement))
			return []

		switch (statement.type) {
			case "text":
				return stringifyText(compiler, statement)
		}

		return undefined
	}

	//#endregion
	////////////////////////////////////

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Internals

	function compileStatements<T> (statements: ChiriStatement[], using: Partial<Scope> | undefined, consumer: (statement: ChiriStatement) => ArrayOr<T> | undefined): T[] {
		scopes.push({
			variables: {
				...scope()?.variables,
				...using?.variables,
			},
			functions: {
				...scope()?.functions,
				...using?.functions,
			},
			mixins: {
				...scope()?.mixins,
				...using?.mixins,
			},
			shorthands: {
				...scope()?.shorthands,
				...using?.shorthands,
			},
		})

		const results: T[] = []
		for (const statement of statements) {
			const result = consumer(statement)
			if (result === undefined)
				throw error((statement as { position?: ChiriPosition }).position, `Failed to compile ${debugStatementString(statement)}`)

			if (Array.isArray(result))
				results.push(...result)
			else
				results.push(result)
		}

		scopes.pop()
		return results
	}

	function debugStatementString (statement: ChiriStatement) {
		const name = "name" in statement ? ` "${statement.name.value}"` : ""
		return statement.type + name
	}

	function resolveAssignments (assignments: Record<string, ChiriExpressionOperand>): Partial<Scope> {
		return Scope.variables(Object.fromEntries(Object.entries(assignments)
			.map(([name, expr]) => [name, resolveExpression(compiler, expr)])))
	}

	function scope () {
		return scopes[scopes.length - 1]
	}

	function getLine (file: string, line: number): string {
		let cursor = 0
		for (let i = 0; i < line; i++) {
			const newlineIndex = file.indexOf("\n", cursor)
			if (newlineIndex === -1)
				return ""

			cursor = newlineIndex + 1
		}

		const lineEnd = file.indexOf("\n", cursor)
		return file.slice(cursor, lineEnd === -1 ? undefined : lineEnd)
	}

	//#endregion
	////////////////////////////////////
}

export default ChiriCompiler
