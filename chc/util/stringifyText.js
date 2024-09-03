const ChiriReader = require("../read/ChiriReader");
const ChiriCompiler = require("../write/ChiriCompiler");
const stringifyExpression = require("./stringifyExpression");

/**
 * @param {ChiriCompiler} compiler
 * @param {ChiriValueText} text
 * @returns {string}
 */
const stringifyText = (compiler, text) => {
	let result = "";
	for (const value of text.content) {
		if (typeof value === "string") {
			result += value;
			continue;
		}

		switch (value.type) {
			case "text-raw":
				result += value.text;
				continue;
			case "interpolation-property":
				result += `var(--${stringifyText(compiler, value.name)})`;
				continue;
			case "interpolation-variable":
				result += stringifyExpression(compiler, compiler.getVariable(value.name.value));
				continue;
			default:
				result += stringifyExpression(compiler, value);
		}
	}

	return result;
};

module.exports = stringifyText;
