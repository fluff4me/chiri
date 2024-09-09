const ChiriReader = require("../../ChiriReader");
const consumeBlockStartOptional = require("../consumeBlockStartOptional");
const consumeBody = require("../consumeBody");
const consumeNewBlockLineOptional = require("../consumeNewBlockLineOptional");
const consumeValue = require("../consumeValue");
const consumeWhiteSpaceOptional = require("../consumeWhiteSpaceOptional");

/**
 * @param {ChiriReader} reader 
 * @return {ChiriFunctionUse | undefined}
 */
module.exports = reader => {
	if (!reader.consumeOptional("#debug"))
		return undefined;

	reader.consume(":");

	/** @type {ChiriValueText[]} */
	let toDebug = [];
	const multiline = consumeBlockStartOptional(reader);
	if (!multiline) {
		consumeWhiteSpaceOptional(reader);
		toDebug.push(consumeValue(reader, false));
	} else
		while (consumeNewBlockLineOptional(reader))
			toDebug.push(consumeValue(reader, false));

	return {
		type: "function-use",
		name: { type: "word", value: "debug", position: { file: "internal", line: 0, column: 0 } },
		variables: { content: { type: "literal", subType: "array", valueType: "*", value: toDebug } },
		content: [],
	};
};
