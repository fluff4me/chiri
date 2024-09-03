const resolveExpression = require("../util/resolveExpression");
const stringifyText = require("../util/stringifyText");
const CSSWriter = require("./CSSWriter");
const DTSWriter = require("./DTSWriter");
const ESWriter = require("./ESWriter");

/**
 * @typedef Scope
 * @property {Record<string, string | number | boolean | undefined>} variables
 * @property {Record<string, ChiriMixin>} mixins
 */

module.exports = class ChiriCompiler {

	/** @type {Scope[]} */
	#scopes = [{ variables: {}, mixins: {} }];

	/** @type {ChiriText[]} */
	#selectorStack = [];

	/**
	 * @param {ChiriAST} ast 
	 * @param {string} dest
	 */
	constructor (ast, dest) {
		this.ast = ast;
		/** @readonly */
		this.es = new ESWriter(this.ast, dest);
		/** @readonly */
		this.dts = new DTSWriter(this.ast, dest);
		/** @readonly */
		this.css = new CSSWriter(this.ast, dest);
	}

	writeFiles () {
		return Promise.all([
			this.es.writeFile(),
			this.dts.writeFile(),
			this.css.writeFile(),
		]);
	}

	get scope () {
		return this.#scopes[this.#scopes.length - 1];
	}

	/** 
	 * @param {string} name
	 */
	getVariable (name) {
		return this.scope.variables[name];
	}

	compile () {
		this.compileStatements(this.ast.statements);
	}

	/**
	 * @param {ChiriStatement[]} statements 
	 */
	compileStatements (statements) {
		for (const statement of statements) {
			switch (statement.type) {
				case "variable":
					this.scope.variables[statement.name.value] = resolveExpression(this, statement.expression);
					break;
				case "documentation":
					break;
				case "mixin":
					if (!statement.used)
						// unused mixins are ignored
						continue;

					this.scope.mixins[statement.name.value] = statement;

					this.css.write(".");
					this.css.writeWord(statement.name);
					this.css.writeSpaceOptional();

					this.css.writeBlock(() => {
						this.compileStatements(statement.content);
					});

					break;
				case "mixin-use":
					const mixin = this.scope.mixins[statement.name.value];
					this.#scopes.push({
						variables: {
							...this.scope.variables,
							...Object.fromEntries(Object.entries(statement.variables)
								.map(([name, expr]) => [name, resolveExpression(this, expr)])),
						},
						mixins: this.scope.mixins,
					});
					// TODO save this as 
					break;
				case "rule":
					const className = statement.className?.content ?? [];
					const state = statement.state;

					const containingSelector = this.#selectorStack[this.#selectorStack.length - 1];

					/** @type {ChiriText} */
					const selector = !className.length ? containingSelector : {
						type: "text",
						content: !containingSelector ? className : [...containingSelector?.content ?? [], "-", ...className],
						position: /** @type {ChiriPosition} */(statement.className?.position ?? statement.state?.position),
					};
					this.#selectorStack.push(selector);

					this.#selectorStack.pop();
					break;
				case "property":
					if (statement.isCustomProperty) this.css.write("--");
					this.css.writeTextInterpolated(this, statement.property);
					this.css.write(":");
					this.css.writeSpaceOptional();
					this.css.writeTextInterpolated(this, statement.value);
					this.css.writeLine(";");
					break;
				case "root":
					this.css.indent();
					this.css.writeLine(":root{");

					this.compileStatements(statement.content);

					this.css.unindent();
					this.css.writeLine("}");
			}
		}
	}

	/** 
	 * @overload
	 * @param {string} message
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {number} errorPosition
	 * @param {string} message
	 * @returns {void}
	 */
	/**
	 * @param {number | string} errorPositionOrMessage
	 * @param {string=} message 
	 */
	error (errorPositionOrMessage, message) {
		if (typeof errorPositionOrMessage === "number")
			this.i = errorPositionOrMessage;
		else
			message = errorPositionOrMessage;

		return new Error(message ?? "Compilation failed for an unknown reason");
	}
}
