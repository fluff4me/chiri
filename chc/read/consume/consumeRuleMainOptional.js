const ChiriReader = require("../ChiriReader");
const consumeBody = require("./consumeBody");
const consumeWordInterpolated = require("./consumeWordInterpolated");

/**
 * @param {ChiriReader} reader 
 * @returns {Promise<ChiriRule | undefined>}
 */
module.exports = async reader => {
	if (reader.context === "mixin")
		return undefined;

	const prefix = reader.consumeOptional(reader.context === "rule" ? "&-" : ".");
	if (!prefix)
		return undefined;

	const className = consumeWordInterpolated(reader);
	reader.consume(":");

	return {
		type: "rule",
		className,
		state: undefined,
		...await consumeBody(reader, "rule"),
	}
};
