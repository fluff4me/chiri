// @ts-check

const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");

/** 
 * @param {import("../ThetaReader")} reader 
 * @returns {true}
 */
module.exports = reader => {
	if (!consumeWhiteSpaceOptional(reader))
		throw reader.error("Expected whitespace");
	return true;
};
