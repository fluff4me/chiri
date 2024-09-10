import type { ChiriAST, ChiriMixin, ChiriStatement, ChiriText } from "../ChiriAST"
import resolveExpression from "../util/resolveExpression"
import CSSWriter from "./CSSWriter"
import DTSWriter from "./DTSWriter"
import ESWriter from "./ESWriter"

interface Scope {
	variables: Record<string, string | number | boolean | undefined>
	mixins: Record<string, ChiriMixin>
}

export default class ChiriCompiler {

	#scopes: Scope[] = [{ variables: {}, mixins: {} }]
	#selectorStack: ChiriText[] = []

	public readonly es: ESWriter
	public readonly dts: DTSWriter
	public readonly css: CSSWriter

	constructor (public readonly ast: ChiriAST, dest: string) {
		this.ast = ast
		this.es = new ESWriter(this.ast, dest)
		this.dts = new DTSWriter(this.ast, dest)
		this.css = new CSSWriter(this.ast, dest)
	}

	writeFiles () {
		return Promise.all([
			this.es.writeFile(),
			this.dts.writeFile(),
			this.css.writeFile(),
		])
	}

	get scope () {
		return this.#scopes[this.#scopes.length - 1]
	}

	/** 
	 * @param {string} name
	 */
	getVariable (name: string) {
		return this.scope.variables[name]
	}

	compile () {
		this.compileStatements(this.ast.statements)
	}

	/**
	 * @param {ChiriStatement[]} statements 
	 */
	compileStatements (statements: ChiriStatement[]) {
		for (const statement of statements) {
			switch (statement.type) {
				case "variable":
					this.scope.variables[statement.name.value] = resolveExpression(this, statement.expression)
					break
				case "documentation":
					break
				case "mixin":
					if (!statement.used)
						// unused mixins are ignored
						continue

					this.scope.mixins[statement.name.value] = statement

					this.css.write(".")
					this.css.writeWord(statement.name)
					this.css.writeSpaceOptional()

					this.css.writeBlock(() => {
						this.compileStatements(statement.content)
					})

					break
				case "mixin-use": {
					const mixin = this.scope.mixins[statement.name.value]
					this.#scopes.push({
						variables: {
							...this.scope.variables,
							...Object.fromEntries(Object.entries(statement.variables)
								.map(([name, expr]) => [name, resolveExpression(this, expr)])),
						},
						mixins: this.scope.mixins,
					})
					// TODO save this as 
					break
				}
				case "rule": {
					const className = statement.className?.content ?? []
					const state = statement.state

					const containingSelector = this.#selectorStack[this.#selectorStack.length - 1]

					const selector: ChiriText = !className.length ? containingSelector : {
						type: "text",
						valueType: "string",
						content: !containingSelector ? className : [...containingSelector?.content ?? [], "-", ...className],
						position: (statement.className?.position ?? statement.state?.position)!,
					}
					this.#selectorStack.push(selector)

					this.#selectorStack.pop()
					break
				}
				case "property":
					if (statement.isCustomProperty) this.css.write("--")
					this.css.writeTextInterpolated(this, statement.property)
					this.css.write(":")
					this.css.writeSpaceOptional()
					this.css.writeTextInterpolated(this, statement.value)
					this.css.writeLine(";")
					break
				case "root":
					this.css.indent()
					this.css.writeLine(":root{")

					this.compileStatements(statement.content)

					this.css.unindent()
					this.css.writeLine("}")
			}
		}
	}

	error (message: string) {
		return new Error(message ?? "Compilation failed for an unknown reason")
	}
}
