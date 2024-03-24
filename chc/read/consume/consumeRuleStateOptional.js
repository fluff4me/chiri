const ChiriReader = require("../ChiriReader");
const { STATES } = require("../../util/componentStates");
const consumeBody = require("./consumeBody");
const consumeWord = require("./consumeWord");
const consumeWordInterpolated = require("./consumeWordInterpolated");

/**
 * @param {ChiriReader} reader 
 * @returns {Promise<ChiriRuleState | undefined>}
 */
module.exports = async reader => {
	const prefix = reader.consumeOptional(":");
	if (!prefix)
		return undefined;

	const state = reader.consume(...STATES);

	reader.consume(":");

	return {
		type: "rule",
		subType: "state",
		state,
		...await consumeBody(reader),
	}
};
