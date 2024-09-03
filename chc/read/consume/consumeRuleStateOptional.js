const ChiriReader = require("../ChiriReader");
const { STATES } = require("../../util/componentStates");
const consumeBody = require("./consumeBody");
const consumeWord = require("./consumeWord");
const consumeWordInterpolated = require("./consumeWordInterpolated");

/**
 * @param {ChiriReader} reader 
 * @returns {Promise<ChiriRule | undefined>}
 */
module.exports = async reader => {
	const prefix = reader.consumeOptional(":");
	if (!prefix)
		return undefined;

	const position = reader.getPosition();
	const state = reader.consume(...STATES);

	reader.consume(":");

	return {
		type: "rule",
		className: undefined,
		state: {
			type: "text",
			content: [{ type: "text-raw", text: state, position }],
			position,
		},
		...await consumeBody(reader, "rule"),
	}
};
