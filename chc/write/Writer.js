const { SourceMapGenerator } = require("source-map");
const ansi = require("../../ansi");
const stringifyText = require("../util/stringifyText");
const ChiriCompiler = require("./ChiriCompiler");
const fsp = require("fs/promises");

module.exports = class Writer {

	#indent = 0;

	/**
	 * @param {ChiriAST} ast
	 * @param {string} dest
	 * @param {ChiriWriteConfig} config 
	 */
	constructor (ast, dest, config) {
		this.config = config;
		this.dest = dest + config.extension;
		this.output = "";

		this.map = new SourceMapGenerator({ file: this.dest });
		for (const [filename, source] of Object.entries(ast.source))
			this.map.setSourceContent(filename, source);
	}

	indent () {
		this.#indent++;
	}

	unindent () {
		this.#indent--;
		if (this.output[this.output.length - 1] === "\t")
			this.output = this.output.slice(0, -1);
	}

	writeFile () {
		return fsp.writeFile(this.dest, this.output);
	}

	/**
	 * @param {string} text 
	 */
	write (text) {
		this.output += text;
	}

	/**
	 * @param {string} text 
	 */
	writeLine (text) {
		this.output += text;
		this.writeNewLine();
	}

	/**
	 * @param {ChiriCompiler} compiler
	 * @param {ChiriValueText} source 
	 */
	writeTextInterpolated (compiler, source) {
		this.addMapping(source.position);
		this.output += stringifyText(compiler, source);
	}

	/** 
	 * @param {ChiriWord} source 
	 */
	writeWord (source) {
		this.addMapping(source.position, source.value);
		this.output += source.value;
	}

	writeNewLine () {
		this.output += "\n" + "\t".repeat(this.#indent);
	}

	writeNewLineOptional () {
		this.writeNewLine();
	}

	writeSpaceOptional () {
		this.output += " ";
	}

	/**
	 * @param {() => any} inside 
	 */
	writeBlock (inside) {
		const startIndex = this.output.length;
		this.indent();
		this.writeLine("{");
		const insideStartIndex = this.output.length;
		inside();
		if (this.output.length === insideStartIndex) {
			this.output = this.output.slice(0, startIndex);
			this.write("{}");
			this.#indent--;
			return;
		}

		this.unindent();
		this.writeLine("}");
	}

	/**
	 * @param {ChiriPosition} sourcePosition 
	 * @param {string=} tokenName 
	 */
	addMapping (sourcePosition, tokenName) {
		this.map.addMapping({
			generated: this.getPosition(),
			source: sourcePosition.file,
			original: sourcePosition,
			name: tokenName,
		});
	}

	getLineStart (at = this.output.length) {
		return this.output.lastIndexOf("\n", at - 1) + 1;
	}

	getLineEnd (at = this.output.length) {
		let index = this.output.indexOf("\n", at);
		if (index === -1)
			return this.output.length;

		while (this.output[--index] === "\r");
		return index + 1;
	}

	/** @returns {Omit<ChiriPosition, "file">} */
	getPosition (at = this.output.length) {
		return {
			line: this.getLineNumber(at) + 1,
			column: this.getColumnNumber(at) + 1,
		}
	}

	/** @type {number} */
	#lastLineNumber = 0;
	/** @type {number} */
	#lastLineNumberPosition = 0;
	getLineNumber (at = this.output.length) {
		const recalc = at < this.#lastLineNumberPosition;
		if (recalc)
			console.warn(ansi.err + "Recalculating line number from start :(");

		let newlines = recalc ? 0 : this.#lastLineNumber;
		let j = recalc ? 0 : this.#lastLineNumberPosition
		for (; j < at; j++)
			if (this.output[j] === "\n")
				newlines++;

		if (!recalc) {
			this.#lastLineNumber = newlines;
			this.#lastLineNumberPosition = at;
		}

		return newlines;
	}

	getColumnNumber (at = this.output.length - 1) {
		return at - this.getLineStart(at);
	}
}
