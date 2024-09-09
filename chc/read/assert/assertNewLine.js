// @ts-check

const consumeCommentOptional = require("../consume/consumeCommentOptional");
const consumeNewLineOptional = require("../consume/consumeNewLineOptional");
const consumeWhiteSpaceOptional = require("../consume/consumeWhiteSpaceOptional");

/** 
 * @param {import("../ChiriReader")} reader 
 * @param {string=} message
 */
module.exports = (reader, message = "Expected newline") => {
	const savedPosition = reader.savePosition();

	consumeCommentOptional(reader);
	while (reader.consumeOptional("\r"));
	if (!reader.consumeOptional("\n"))
		throw reader.error(message);

	reader.restorePosition(savedPosition);
};
