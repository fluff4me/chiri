const ChiriCompiler = require("../write/ChiriCompiler");
const resolveLiteralValue = require("./resolveLiteralValue");

/**
 * @param {ChiriCompiler} compiler 
 * @param {ChiriExpressionOperand=} expression
 * @returns {undefined | number | boolean | string}
 */
const resolveExpression = (compiler, expression) => {
	if (!expression)
		return undefined;

	switch (expression.type) {
		case "literal":
			return resolveLiteralValue(compiler, expression);

		case "get":
			return compiler.getVariable(expression.name.value);

		case "expression":
			switch (expression.subType) {
				case "unary": {
					/** @type {any} */
					const operand = resolveExpression(compiler, expression.operand);
					switch (expression.operator) {
						case "!":
							return !operand;
						case "+":
							return +operand;
						case "-":
							return -operand;
						case "~":
							return ~operand;
						default:
							throw compiler.error(`Unable to resolve unary operator "${expression.operator}"`);
					}
				}
				case "binary": {
					/** @type {any} */
					const operandA = resolveExpression(compiler, expression.operandA);
					/** @type {any} */
					const operandB = resolveExpression(compiler, expression.operandB);
					switch (expression.operator) {
						case "+":
							return operandA + operandB;
						case "-":
							return operandA - operandB;
						case "*":
							return operandA * operandB;
						case "/":
							return operandA / operandB;
						case "%":
							return operandA % operandB;
						case "**":
							return operandA ** operandB;
						case "==":
							return operandA === operandB;
						case "!=":
							return operandA !== operandB;
						case "||":
							return operandA || operandB;
						case "&&":
							return operandA && operandB;
						case "|":
							return operandA | operandB;
						case "&":
							return operandA & operandB;
						case "^":
							return operandA ^ operandB;
						default:
							throw compiler.error(`Unable to resolve binary operator "${expression.operator}"`);
					}
				}
			}
	}
};

module.exports = resolveExpression;
