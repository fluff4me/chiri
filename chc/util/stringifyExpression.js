const ChiriCompiler = require("../write/ChiriCompiler");
const resolveExpression = require("./resolveExpression");
const resolveLiteralValue = require("./resolveLiteralValue");

/**
 * @param {ChiriCompiler} compiler
 * @param {ChiriExpressionOperand | string | number | boolean=} expression
 * @returns {string}
 */
const stringifyExpression = (compiler, expression) => {
	if (expression === undefined)
		return "";

	const resolved = typeof expression === "object" ? resolveExpression(compiler, expression) : expression;
	switch (typeof resolved) {
		case "number":
		case "boolean":
			return `${resolved}`;
		case "undefined":
			return "";
		case "string":
			return resolved;
		default:
			throw compiler.error(`Expression resolved to unstringifiable type "${typeof resolved}"`);
	}
};

resolveLiteralValue.stringifyExpression = stringifyExpression;

module.exports = stringifyExpression;
