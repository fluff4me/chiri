const ChiriReader = require("../ChiriReader");
const getMixinParameters = require("../../util/getFunctionParameters");
const consumeExpression = require("./consumeExpression");
const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");
const consumeWord = require("./consumeWord");
const consumeWordOptional = require("./consumeWordOptional");
const consumeFunctionParameters = require("./consumeFunctionParameters");

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
	if (!mixin)
		throw reader.error(start, `No declaration for %${word.value}`);

	const assignments = consumeFunctionParameters(reader, start, mixin);

	// if ()

	mixin.used = true;
	return {
		type: "mixin-use",
		name: word,
		variables: assignments,
	};
};
