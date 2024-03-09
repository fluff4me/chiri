// @ts-check
const { SourceMapGenerator } = require("source-map");
const ansi = require("../../ansi");

module.exports = class ESWriter {

	static extension = ".js";

	/** 
	 * @param {ChiriAST} ast
	 * @param {string} dest
	 */
	constructor (ast, dest) {
		this.ast = ast;
		this.dest = dest + ESWriter.extension;
		this.output = "";
		this.indent = 0;

		this.map = new SourceMapGenerator({ file: this.dest });
		this.map.setSourceContent(ast.filename, ast.source);
	}

	error (message) {
		return new Error(message ?? "Emit failed for an unknown reason");
	}

	write () {
		try {
			for (const statement of this.ast.statements) {
				this.writeStatement(statement);
			}

		} catch (err) {
			let message = err.message;
			let stack = err.stack;
			stack = err.stack?.slice(err.stack.indexOf("\n", err.stack.indexOf("\n") + 1)) ?? "";
			console.error(ansi.err + message, ansi.reset + stack);
		}

		return this.output += `\n//# sourceMappingURL=data:application/json;base64,${btoa(this.map.toString())}`;
	}

	/** 
	 * @param {Omit<ChiriWord, "type">} source 
	 * @param {string=} word
	 */
	writeWord (source, word = source.value) {
		const writePosition = this.getPosition();
		this.output += word;
		this.map.addMapping({
			generated: writePosition,
			source: this.ast.filename,
			original: source.position,
			name: source.value,
		})
	}

	writeNewLine () {
		this.output += "\n" + "\t".repeat(this.indent);
	}

	/**
	 * @param {ChiriStatement} statement 
	 */
	writeStatement (statement) {
		switch (statement.type) {
			case "documentation": return this.writeDocumentation(statement);
			case "declaration": return this.writeDeclaration(statement);
			case "iife": return this.writeIIFE(statement);
		}
	}

	/** @param {ChiriDeclaration} declaration */
	writeDeclaration (declaration) {
		this.writeWord({
			position: declaration.position,
			value: declaration.valueType,
		}, "const");

		this.output += " ";
		this.writeWord(declaration.name, `_${declaration.name.value}`);

		this.output += " = ";
		this.writeExpressionOperand(declaration.expression);
		this.output += ";";
		this.writeNewLine();
	}

	/** @param {ChiriExpressionOperand} operand */
	writeExpressionOperand (operand) {
		switch (operand.type) {
			case "expression": return this.writeExpression(operand);
			case "literal": return this.writeLiteral(operand);
			case "get": return this.writeWord(operand.name, `_${operand.name.value}`);
		}
	}

	/** @param {ChiriBinaryExpression | ChiriUnaryExpression} expression */
	writeExpression (expression) {
		switch (expression.subType) {
			case "binary": return this.writeBinaryExpression(expression);
			case "unary": return this.writeUnaryExpression(expression);
		}
	}

	/** @param {ChiriBinaryExpression} expression */
	writeBinaryExpression (expression) {
		if (expression.wrapped) this.output += "(";

		this.writeExpressionOperand(expression.operandA);

		this.output += expression.operator;

		this.writeExpressionOperand(expression.operandB);

		if (expression.wrapped) this.output += ")";
	}

	/** @param {ChiriUnaryExpression} expression */
	writeUnaryExpression (expression) {
		this.output += expression.operator;
		this.writeExpressionOperand(expression.operand);
	}

	/** @param {ChiriLiteralValue} literal */
	writeLiteral (literal) {
		switch (literal.subType) {
			case "boolean": return this.writeWord({
				position: literal.position,
				value: literal.value ? "true" : "false",
			});
			case "undefined": return this.writeWord({
				position: literal.position,
				value: ".",
			}, "undefined");
			case "dec": case "int": case "uint": return this.writeWord({
				position: literal.position,
				value: literal.value,
			});
			case "string": {
				this.output += "`";
				for (const segment of literal.segments) {
					if (typeof segment === "string") this.output += segment;
					else {
						this.output += "${";
						this.writeExpressionOperand(segment);
						this.output += "}";
					}
				}
				this.output += "`";
				break;
			}
			default: throw this.error(`No ES write definition for type '${literal.subType === "other" ? literal.valueType : /** @type {ChiriLiteralValue} */(literal).subType}'`)
		}
	}

	/** @param {ChiriIIFE} iife */
	writeIIFE (iife) {
		throw this.error("I don't know how to write IIFEs yet!");
	}

	/** @param {ChiriDocumentation} documentation */
	writeDocumentation (documentation) {
		const indent = "\t".repeat(this.indent);
		this.output += `${indent}/**${documentation.content.split(REGEX_NEWLINE)
			.map(line => `\n${indent} * ${line}`)
			.join("")}\n${indent} */\n`;
	}

	/** @param {string} content */
	writeOutputString (content) {
		const indent = "\t".repeat(this.indent);
		this.output += `${indent}${content.split(REGEX_NEWLINE)
			.map(line => `\n${indent}${line}`)
			.join("")}`
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

	/** @returns {ChiriPosition} */
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

const REGEX_NEWLINE = /\n/g;
