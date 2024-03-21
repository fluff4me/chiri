const ChiriReader = require("../ChiriReader");
const stringifyExpression = require("./stringifyExpression");

/**
 * @param {ChiriReader} reader
 * @param {ChiriValueText} text
 * @param {"compiletime" | "runtime"} mode
 * @returns {string}
 */
module.exports = (reader, text, mode) => {
	let result = "";
	for (const value of text.content) {
		switch (value.type) {
			case "text-raw":
				result += value.text;
				continue;
			case "interpolation-property":
				if (mode === "compiletime")
					throw new Error("Can't produce a compile-time string for a CSS custom property");;
				result += `var(--${value.name.value})`;
				continue;
			case "interpolation-variable":
				result += stringifyExpression(reader, reader.getVariable(value.name.value).expression);
				continue;
			default:
				result += stringifyExpression(reader, value);
		}
	}

	return result;
};
