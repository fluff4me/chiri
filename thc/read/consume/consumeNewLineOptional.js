// @ts-check

const consumeCommentOptional = require("./consumeCommentOptional");

/** @param {import("../ThetaReader")} reader */
module.exports = reader => {
	const e = reader.i;
	consumeCommentOptional(reader);
	while (reader.consumeOptional("\r"));
	if (reader.consumeOptional("\n"))
		return true;

	reader.i = e;
	return false;
};
