// @ts-check

const ansi = require("../../ansi");
const consumeDocumentationOptional = require("./consume/consumeDocumentationOptional");
const ChiriTypeManager = require("./ChiriTypeManager");
const consumeMixinOptional = require("./consume/consumeMixinOptional");
const path = require("path");
const consumeMacroOptional = require("./consume/consumeMacroOptional");
const consumeNewBlockLineOptional = require("./consume/consumeNewBlockLineOptional");
const consumePropertyOptional = require("./consume/consumePropertyOptional");
const consumeBlockEnd = require("./consume/consumeBlockEnd");
const consumeRuleMainOptional = require("./consume/consumeRuleMainOptional");
const consumeRuleStateOptional = require("./consume/consumeRuleStateOptional");
const consumeMixinUseOptional = require("./consume/consumeMixinUseOptional");
const consumeImportOptional = require("./consume/consumeImportOptional");
const fsp = require("fs/promises");
const relToCwd = require("../util/relToCwd");
const prefixError = require("../util/prefixError");

const lib = path.join(path.dirname(path.dirname(__dirname)), "lib");

class ChiriReader {

	/**
	 * @param {string} filename 
	 * @param {string=} cwd
	 */
	static async load (filename, cwd) {
		filename = path.resolve(filename);
		if (!filename.endsWith(".chiri"))
			filename += ".chiri";
		const ch = await fsp.readFile(filename, "utf8");
		return new ChiriReader(filename, ch, cwd);
	}

	types = new ChiriTypeManager();

	/** @type {ChiriStatement[]} */
	#statements = [];

	/** @type {number=} */
	#errorStart = undefined;

	i = 0;
	indent = 0;
	#multiline = true;
	#isSubReader = false;
	#errored = false;

	/**
	 * @param {string} filename 
	 * @param {string} input 
	 * @param {string=} cwd
	 */
	constructor (filename, input, cwd) {
		/** @readonly */
		this.filename = filename;
		/** @readonly */
		this.basename = path.join(path.dirname(filename), path.basename(filename, path.extname(filename)));
		/** @readonly */
		this.dirname = path.dirname(filename);
		/** @readonly */
		this.cwd = cwd ?? this.dirname;
		/** @readonly */
		this.input = input;
		/** @type {ChiriText} */
		this.componentName = {
			type: "text",
			content: [],
			position: { line: -1, column: -1, file: filename },
		};
	}

	/**
	 * @param {boolean} multiline 
	 */
	sub (multiline) {
		const reader = new ChiriReader(this.filename, this.input);
		reader.i = this.i;
		reader.indent = this.indent;
		reader.#multiline = multiline;
		reader.#lastLineNumber = this.#lastLineNumber;
		reader.#lastLineNumberPosition = this.#lastLineNumberPosition;
		reader.#statements = [...this.#statements];
		reader.types = this.types.clone();
		reader.#isSubReader = true;
		reader.componentName = {
			...this.componentName,
			content: this.componentName.content.slice(),
		};
		return reader;
	}

	/**
	 * Update this reader to the position of the subreader
	 * @param {ChiriReader} reader 
	 */
	update (reader) {
		this.i = reader.i;
		this.indent = reader.indent;
		this.#errored = reader.#errored;
	}

	/** 
	 * @param {string} name
	 */
	getVariable (name) {
		return this.#statements.findLast(/** @returns {statement is ChiriCompilerVariable} */ statement =>
			statement.type === "variable" && statement.name.value === name);
	}

	/** 
	 * @param {string} name
	 */
	getMixin (name) {
		return this.#statements.findLast(/** @returns {statement is ChiriMixin} */ statement =>
			statement.type === "mixin" && statement.name.value === name);
	}

	/** @param {string} name */
	getType (name) {
		const type = this.types.types[name];
		if (!type)
			throw this.error(`There is no type by name '${name}'`);
		return type;
	}

	/** 
	 * @param {string} name
	 * @returns {import("./ChiriTypeManager").ChiriTypeDefinition | undefined}
	 */
	getTypeOptional (name) {
		return this.types.types[name];
	}

	getUnaryOperators () {
		return this.types.unaryOperators;
	}

	getBinaryOperators () {
		return this.types.binaryOperators;
	}

	/** @returns {Promise<ChiriAST>} */
	async read () {
		/** @type {Record<string, string>} */
		const source = {
			[this.filename]: this.input,
		};

		let ignoreNewLineRequirement = this.#isSubReader;
		try {
			while (true) {
				let e = this.i;
				if (this.#multiline)
					while (consumeNewBlockLineOptional(this));

				if (this.i >= this.input.length)
					break;

				if (this.i && this.i === e && this.#multiline && !ignoreNewLineRequirement) {
					if (consumeBlockEnd(this))
						break;

					throw this.error("Expected newline");
				}

				ignoreNewLineRequirement = false;

				e = this.i;
				const documentation = consumeDocumentationOptional(this);
				if (documentation)
					this.#statements.push(documentation);

				const macro = consumeMacroOptional(this);
				if (macro) {
					// if (macro.type === "variable")
					// 	this.#variables[macro.name.value] = this.#statements.length;
					this.#statements.push(macro);
				}

				if (this.#errored)
					break;

				const mixin = await consumeMixinOptional(this);
				if (mixin) {
					// this.#variables[mixin.name.value] = this.#statements.length;
					this.#statements.push(mixin);
				}

				const mixinUse = consumeMixinUseOptional(this);
				if (mixinUse) {
					this.#statements.push(mixinUse);
				}

				const property = consumePropertyOptional(this);
				if (property) {
					this.#statements.push(property);
				}

				const rule = (await consumeRuleMainOptional(this)) || (await consumeRuleStateOptional(this));
				if (rule)
					this.#statements.push(rule);

				const imp = consumeImportOptional(this);
				if (imp) {
					const dirname = !imp.module ? this.dirname : imp.module === "chiri" ? lib : require.resolve(imp.module);
					const filename = imp.path.startsWith("/") ? path.join(this.cwd, imp.path) : path.resolve(dirname, imp.path);
					if (source[filename])
						throw this.error(`Cannot recursively import file '${relToCwd(filename, this.cwd)}'`);

					let sub;
					try {
						sub = await ChiriReader.load(filename, this.cwd);
					} catch (e) {
						const err = /** @type {Error} */(e);
						this.#errorStart = this.i;
						this.i = imp.i;
						const message = err.message?.includes("no such file") ? "does not exist" : (err.message ?? "unknown error");
						throw this.error(`Cannot import file '${relToCwd(filename, this.cwd)}': ${message}`);
					}
					const ast = await sub.read();
					Object.assign(source, ast.source);
					this.#statements.push(...ast.statements);
				}

				if (this.#errored)
					break;

				if (!this.#multiline)
					break;

				if (this.i === e)
					throw this.error("Failed to continue parsing");
			}

		} catch (err) {
			this.#errored = true;
			this.logLine(this.#errorStart, /** @type {Error} */(err));
		}

		return {
			source,
			statements: this.#statements,
		};
	}

	/**
	 * @param {number=} start
	 * @param {(Error | string)=} errOrMessage
	 */
	logLine (start, errOrMessage) {
		const line = this.getCurrentLine(undefined, true)
			.replace(/\r/g, ansi.whitespace + "\u240D" + ansi.reset)
			.replace(/\n/g, ansi.whitespace + "\u240A" + ansi.reset)
			.replace(/ /g, ansi.whitespace + "\u00B7" + ansi.reset)
			.replace(/\t/g, ansi.whitespace + "\u2192" + ansi.reset);

		const lineNumber = this.getLineNumber();
		const columnNumber = this.getColumnNumber();

		const err = typeof errOrMessage === "string" ? undefined : errOrMessage;
		const message = typeof errOrMessage === "string" ? errOrMessage : undefined;

		const filename = ansi.path + path.relative(process.cwd(), this.filename) + ansi.filepos + `:${lineNumber + 1}:${columnNumber + 1}`;
		console[err ? "error" : "info"](filename
			+ ansi.label + (errOrMessage ? " - " : "")
			+ ansi.reset + (!err ? message ?? "" : ansi.err + err.message) + "\n"
			+ ansi.label + "  " + `${lineNumber + 1}`.padStart(5) + " " + ansi.reset + line + "\n"
			+ (err ? ansi.err : ansi.filepos) + `        ${" ".repeat(columnNumber)}${"^".repeat((start ?? this.i) - this.i || 1)}`
			+ ansi.reset
			+ (!err?.stack ? ""
				: `\n${err.stack.slice(err.stack.indexOf("\n", start === undefined ? 0 : err.stack.indexOf("\n") + 1) + 1)}`));
	}

	/**
	 * @param {...string} strings 
	 */
	consume (...strings) {
		NextString: for (const string of strings) {
			for (let j = 0; j < string.length; j++)
				if (this.input[this.i + j] !== string[j])
					continue NextString;

			this.i += string.length;
			return string;
		}

		strings = strings.map(string => string
			.replace(/\r/g, "\u240D")
			.replace(/\n/g, "\u240A")
			.replace(/ /g, "\u00B7")
			.replace(/\t/g, "\u2192"));
		throw this.error("Expected "
			+ (strings.length === 1 ? strings[0]
				: "any of" + strings.map(string => `'${string}'`).join(", ")));
	}

	/**
	 * @param {...string} strings 
	 */
	consumeOptional (...strings) {
		NextString: for (const string of strings) {
			for (let j = 0; j < string.length; j++)
				if (this.input[this.i + j] !== string[j])
					continue NextString;

			this.i += string.length;
			return string;
		}

		return undefined;
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

	getLineEnd (at = this.i, includeNewline = false) {
		let index = this.input.indexOf("\n", at);
		if (index === -1)
			return this.input.length;

		if (!includeNewline)
			while (this.input[--index] === "\r");
		return index + 1;
	}

	/**
	 * @typedef ChiriPositionState
	 * @property {number} lastLineNumber
	 * @property {number} lastLineNumberPosition
	 * @property {number} i
	 */

	/** 
	 * @returns {ChiriPositionState}
	 */
	savePosition () {
		return {
			i: this.i,
			lastLineNumber: this.#lastLineNumber,
			lastLineNumberPosition: this.#lastLineNumberPosition,
		};
	}
	/**
	 * @param {ChiriPositionState} state 
	 */
	restorePosition (state) {
		this.#lastLineNumberPosition = state.lastLineNumberPosition;
		this.#lastLineNumber = state.lastLineNumber;
		this.i = state.i;
	}

	/** @returns {ChiriPosition} */
	getPosition (at = this.i) {
		return {
			file: this.filename,
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

	getCurrentLine (at = this.i, includeNewline = false) {
		return this.input.slice(this.getLineStart(at), this.getLineEnd(at, includeNewline));
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
