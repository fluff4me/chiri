const ChiriReader = require("../ChiriReader");
const resolveExpression = require("./resolveExpression");

/**
 * @param {ChiriReader} reader
 * @param {ChiriExpressionOperand=} expression
 * @returns {string}
 */
const stringifyExpression = (reader, expression) => {
	if (!expression)
		return "";

	const resolved = resolveExpression(reader, expression);
	switch (typeof resolved) {
		case "number":
		case "boolean":
			return `${resolved}`;
		case "undefined":
			return "";
		case "string":
			return resolved;
		default:
			throw reader.error(`Expression resolved to unstringifiable type "${typeof resolved}"`);
	}
};

module.exports = stringifyExpression;
