const ChiriReader = require("../ChiriReader");
const stringifyExpression = require("./stringifyExpression");

/**
 * @param {ChiriReader} reader 
 * @param {ChiriLiteralValue} expression 
 */
module.exports = (reader, expression) => {
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
				.map(segment => typeof segment === "string" ? segment : stringifyExpression(reader, segment))
				.join("");
		default:
			throw new Error(`Unable to resolve literal value type ${subType}`);
	}
};
