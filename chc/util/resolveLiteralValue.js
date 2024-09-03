const ChiriCompiler = require("../write/ChiriCompiler");

let stringifier;

/**
 * @param {ChiriCompiler} compiler 
 * @param {ChiriLiteralValue} expression 
 */
const resolveLiteralValue = (compiler, expression) => {
	const subType = expression.subType;
	switch (subType) {
		case "dec":
		case "int":
		case "uint":
			return +expression.value;
		case "boolean":
			return expression.value;
		case "undefined":
			return undefined;
		case "string":
			return expression.segments
				.map(segment => typeof segment === "string" ? segment : resolveLiteralValue.stringifyExpression?.(compiler, segment))
				.join("");
		default:
			throw new Error(`Unable to resolve literal value type ${subType}`);
	}
};

/** @type {(compiler: ChiriCompiler, expression?: ChiriExpressionOperand | string | number | boolean) => string=} */
resolveLiteralValue.stringifyExpression = undefined;

module.exports = resolveLiteralValue;
