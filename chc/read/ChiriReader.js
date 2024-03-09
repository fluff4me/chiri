// @ts-check

const ansi = require("../../ansi");
const consumeDeclaration = require("./consume/consumeDeclaration");
const consumeDocumentationOptional = require("./consume/consumeDocumentationOptional");
const optionalNewLine = require("./consume/consumeNewLineOptional");
const ChiriTypeManager = require("./ChiriTypeManager");

class ChiriReader {

	#types = new ChiriTypeManager();

	/** @type {ChiriStatement[]} */
	#statements = [];
	/** @type {Record<string, number>} */
	#declarations = {};

	/** @type {number=} */
	#errorStart = undefined;

	/**
	 * @param {string} filename 
	 * @param {string} input 
	 */
	constructor (filename, input) {
		/** @readonly */
		this.filename = filename;
		/** @readonly */
		this.input = input;
		this.i = 0;
		this.indent = 0;
	}

	/** 
	 * @param {string} name
	 */
	getDeclarationOptional (name) {
		const declaration = this.#statements[this.#declarations[name]];
		if (declaration?.type !== "declaration")
			return undefined;
		return declaration;
	}

	/** @param {string} name */
	getDeclaration (name) {
		const declaration = this.#statements[this.#declarations[name]];
		if (declaration?.type !== "declaration")
			throw this.error(`Nothing by name '${name}' declared`);
		return declaration;
	}

	/** @param {string} name */
	getType (name) {
		const type = this.#types.types[name];
		if (!type)
			throw this.error(`There is no type by name '${name}'`);
		return type;
	}

	/** 
	 * @param {string} name
	 * @returns {import("./ChiriTypeManager").ChiriTypeDefinition | undefined}
	 */
	getTypeOptional (name) {
		return this.#types.types[name];
	}

	getUnaryOperators () {
		return this.#types.unaryOperators;
	}

	getBinaryOperators () {
		return this.#types.binaryOperators;
	}

	/** @returns {ChiriAST} */
	read () {
		try {
			while (true) {
				const e = this.i;
				while (optionalNewLine(this));
				if (this.i >= this.input.length)
					break;

				if (this.i && this.i === e)
					throw this.error("Expected newline");

				const documentation = consumeDocumentationOptional(this);
				if (documentation)
					this.#statements.push(documentation);

				const declaration = consumeDeclaration(this);
				if (declaration) {
					this.#declarations[declaration.name.value] = this.#statements.length;
					this.#statements.push(declaration);
				}
			}

		} catch (err) {
			const compilationError = this.#errorStart !== undefined;
			const line = this.getCurrentLine()
				.replace(/\n/g, ansi.whitespace + "\u21A9" + ansi.reset)
				.replace(/ /g, ansi.whitespace + "\u00B7" + ansi.reset)
				.replace(/\t/g, ansi.whitespace + "\u2192" + ansi.reset);

			console.error(ansi.err + err.message + "\n"
				+ ansi.label + "  " + `${this.getLineNumber() + 1}`.padStart(5) + " " + ansi.reset + line + "\n"
				+ ansi.err + `        ${" ".repeat(this.getColumnNumber())}${"^".repeat((this.#errorStart ?? this.i) - this.i || 1)}`
				+ ansi.reset + "\n"
				+ (err.stack?.slice(err.stack.indexOf("\n", !compilationError ? 0 : err.stack.indexOf("\n") + 1) + 1)) ?? "");
		}

		return {
			filename: this.filename,
			source: this.input,
			statements: this.#statements,
		};
	}

	consume (/** @type {string} */ string) {
		for (let j = 0; j < string.length; j++)
			if (this.input[this.i + j] !== string[j])
				throw this.error("Expected " + string);

		this.i += string.length;
		return string;
	}

	consumeOptional (/** @type {string} */ string) {
		for (let j = 0; j < string.length; j++)
			if (this.input[this.i + j] !== string[j])
				return undefined;

		this.i += string.length;
		return string;
	}

	/** 
	 * @overload
	 * @param {string} message
	 */
	/**
	 * @overload
	 * @param {number} errorPosition
	 * @param {string} message
	 */
	/**
	 * @param {number | string} errorPositionOrMessage
	 * @param {string=} message 
	 */
	error (errorPositionOrMessage, message) {
		this.#errorStart = this.i;
		if (typeof errorPositionOrMessage === "number")
			this.i = errorPositionOrMessage;
		else
			message = errorPositionOrMessage;

		return new Error(message ?? "Compilation failed for an unknown reason");
	}

	getLineStart (at = this.i) {
		return this.input.lastIndexOf("\n", at - 1) + 1;
	}

	getLineEnd (at = this.i) {
		let index = this.input.indexOf("\n", at);
		if (index === -1)
			return this.input.length;

		while (this.input[--index] === "\r");
		return index + 1;
	}

	/** @returns {ChiriPosition} */
	getPosition (at = this.i) {
		return {
			line: this.getLineNumber(at) + 1,
			column: this.getColumnNumber(at) + 1,
		}
	}

	/** @type {number} */
	#lastLineNumber = 0;
	/** @type {number} */
	#lastLineNumberPosition = 0;
	getLineNumber (at = this.i) {
		const recalc = at < this.#lastLineNumberPosition;
		if (recalc) {
			const stack = new Error().stack;
			console.warn(ansi.err + "Recalculating line number from start :(", ansi.reset + "\n" + stack?.slice(stack.indexOf("\n", stack.indexOf("\n") + 1) + 1));
		}

		let newlines = recalc ? 0 : this.#lastLineNumber;
		let j = recalc ? 0 : this.#lastLineNumberPosition
		for (; j < at; j++)
			if (this.input[j] === "\n")
				newlines++;

		if (!recalc) {
			this.#lastLineNumber = newlines;
			this.#lastLineNumberPosition = at;
		}

		return newlines;
	}

	getColumnNumber (at = this.i) {
		return at - this.getLineStart(at);
	}

	getCurrentLine () {
		return this.input.slice(this.getLineStart(), this.getLineEnd());
	}

	isWordChar = (charCode = this.input.charCodeAt(this.i)) => false
		|| charCode === 45 // -
		|| this.isLetter(charCode)
		|| this.isDigit(charCode);

	isLetter = (charCode = this.input.charCodeAt(this.i)) => false
		|| (charCode >= 65 && charCode <= 90) // A-Z
		|| (charCode >= 97 && charCode <= 122); // a-z

	isDigit = (charCode = this.input.charCodeAt(this.i)) => false
		|| (charCode >= 48 && charCode <= 57); // 0-9
}

module.exports = ChiriReader;
