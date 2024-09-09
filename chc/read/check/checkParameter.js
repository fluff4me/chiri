// @ts-check

const consumeCommentOptional = require("../consume/consumeCommentOptional");
const consumeNewLineOptional = require("../consume/consumeNewLineOptional");
const consumeWhiteSpaceOptional = require("../consume/consumeWhiteSpaceOptional");
const consumeWordOptional = require("../consume/consumeWordOptional");

/** @param {import("../ChiriReader")} reader */
module.exports = reader => {
	const savedPosition = reader.savePosition();

	if (!consumeWordOptional(reader))
		return false;

	const result = reader.consumeOptional("=", "\r\n", " ");
	reader.restorePosition(savedPosition);
	return result;
};
