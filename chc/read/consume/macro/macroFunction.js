// @ts-check

const consumeWord = require("../consumeWord");
const consumeBody = require("../consumeBody");

/** 
 * @param {import("../../ChiriReader")} reader 
 * @returns {Promise<ChiriFunction | undefined>}
 */
module.exports = async reader => {
	const savedPosition = reader.savePosition();
	if (!reader.consumeOptional("#function "))
		return undefined;

	const name = consumeWord(reader);

	if (!reader.consume(":")) {
		reader.restorePosition(savedPosition);
		return undefined;
	}

	return {
		type: "function",
		name,
		...await consumeBody(reader, "function"),
	}
};
