const ChiriReader = require("../ChiriReader");
const consumeBlockStartOptional = require("./consumeBlockStartOptional");
const consumeValue = require("./consumeValue");
const consumeWhiteSpace = require("./consumeWhiteSpace");
const consumeWordInterpolated = require("./consumeWordInterpolated");

/**
 * @param {ChiriReader} reader 
 * @returns {ChiriProperty=}
 */
module.exports = reader => {
	if (!reader.isLetter() && reader.input[reader.i] !== "$" && reader.input[reader.i] !== "#")
		return undefined;

	const position = reader.getPosition();
	const isCustomProperty = reader.consumeOptional("$");

	const property = consumeWordInterpolated(reader);

	reader.consume(":");
	consumeWhiteSpace(reader);

	const value = consumeValue(reader, !!consumeBlockStartOptional(reader));

	return {
		type: "property",
		isCustomProperty: isCustomProperty ? true : undefined,
		position,
		property,
		value,
	};
};
