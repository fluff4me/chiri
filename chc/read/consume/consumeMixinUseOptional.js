const ChiriReader = require("../ChiriReader");
const getMixinParameters = require("../../util/getMixinParameters");
const consumeExpression = require("./consumeExpression");
const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");
const consumeWord = require("./consumeWord");
const consumeWordOptional = require("./consumeWordOptional");

/**
 * @param {ChiriReader} reader 
 * @returns {ChiriMixinUse=}
 */
module.exports = reader => {
	const start = reader.i;
	if (!reader.consumeOptional("%"))
		return undefined;

	const word = consumeWordOptional(reader);
	if (!word)
		return undefined;

	const mixin = reader.getMixin(word.value);
	const parameters = getMixinParameters(mixin)
		.sort((a, b) => +!!a.expression - +!!b.expression);

	/** @type {Record<string, ChiriExpressionOperand>} */
	const assignments = {};
	while (consumeWhiteSpaceOptional(reader)) {
		const e = reader.i;
		const word = consumeWordOptional(reader);
		const parameter = word && parameters.find(param => param.name.value === word.value);
		if (!parameter) {
			const expected = parameters
				.filter(param => !assignments[param.name.value])
				.map(param => `${param.expression ? "[" : ""}${param.valueType} ${param.name.value}${param.expression ? "]?" : ""}`)
				.join(", ");
			if (!expected)
				throw reader.error(e, `Unexpected parameter for %${mixin.name.value}`);
			throw reader.error(e, `Expected parameter for %${mixin.name.value}, any of: ${expected}`);
		}

		if (assignments[word.value])
			throw reader.error(`Already assigned  #${word.value} for %${mixin.name.value}`);

		const expectedType = parameter.valueType;

		if (!reader.consumeOptional("=")) {
			if (!reader.types.isAssignable("bool", expectedType))
				throw reader.error(e, `Unable to set #${word.value} to true, expected ${expectedType}`);

			assignments[word.value] = {
				type: "literal",
				subType: "boolean",
				value: true,
			};
			continue;
		}

		assignments[word.value] = consumeExpression(reader, expectedType);
	}

	const missing = parameters.filter(parameter => !parameter.expression && !assignments[parameter.name.value]);
	if (missing.length)
		throw reader.error(start, `Missing parameters for %${word.value}: ${parameters
			.filter(param => !assignments[param.name.value])
			.map(param => `${param.expression ? "[" : ""}${param.valueType} ${param.name.value}${param.expression ? "]?" : ""}`)
			.join(", ")}`);

};
