const ChiriReader = require("../read/ChiriReader");
const resolveLiteralValue = require("./resolveLiteralValue");

/**
 * @param {ChiriReader} reader 
 * @param {ChiriExpressionOperand=} expression
 * @returns {undefined | number | boolean | string}
 */
const resolveExpression = (reader, expression) => {
	if (!expression)
		return undefined;

	switch (expression.type) {
		case "literal":
			return resolveLiteralValue(reader, expression);

		case "get":
			return resolveExpression(reader, reader.getVariable(expression.name.value)?.expression);

		case "expression":
			switch (expression.subType) {
				case "unary": {
					/** @type {any} */
					const operand = resolveExpression(reader, expression.operand);
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
							throw reader.error(`Unable to resolve unary operator "${expression.operator}"`);
					}
				}
				case "binary": {
					/** @type {any} */
					const operandA = resolveExpression(reader, expression.operandA);
					/** @type {any} */
					const operandB = resolveExpression(reader, expression.operandB);
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
							throw reader.error(`Unable to resolve binary operator "${expression.operator}"`);
					}
				}
			}
	}
};

module.exports = resolveExpression;
