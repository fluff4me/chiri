const ChiriReader = require("../ChiriReader");
const consumePathOptional = require("./consumePathOptional");

/**
 * @param {ChiriReader} reader 
 */
module.exports = reader => {
	if (!reader.consumeOptional("@import "))
		return undefined;

	const path = consumePathOptional(reader);
	if (!path)
		throw reader.error(reader.consumeOptional("./") ? "Remove the ./ from the start of this path"
			: "Expected path to import");

	return path;
};
