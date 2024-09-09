// @ts-check

const consumeWord = require("./consumeWord");
const consumeBody = require("./consumeBody");

/** 
 * @param {import("../ChiriReader")} reader 
 * @returns {Promise<ChiriMixin | undefined>}
 */
module.exports = async reader => {
	const savedPosition = reader.savePosition();
	if (!reader.consumeOptional("%"))
		return undefined;

	const name = consumeWord(reader);

	if (!reader.consumeOptional(":")) {
		reader.restorePosition(savedPosition);
		return undefined;
	}

	return {
		type: "mixin",
		name,
		used: false,
		...await consumeBody(reader, "mixin"),
	}
};
