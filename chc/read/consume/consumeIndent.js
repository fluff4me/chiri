// @ts-check

const consumeIndentOptional = require("./consumeIndentOptional");

/** 
 * @param {import("../ChiriReader")} reader 
 * @param {number=} expected
 */
module.exports = (reader, expected) => {
	const result = consumeIndentOptional(reader, expected);
	if (result === undefined)
		throw reader.error("Not enough indentation");
	return result;
};
