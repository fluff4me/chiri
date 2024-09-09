const ChiriReader = require("../../ChiriReader");
const consumeBlockStartOptional = require("../consumeBlockStartOptional");
const consumeNewBlockLineOptional = require("../consumeNewBlockLineOptional");
const consumePathOptional = require("../consumePathOptional");
const consumeWhiteSpaceOptional = require("../consumeWhiteSpaceOptional");

/**
 * @param {ChiriReader} reader 
 * @returns {ChiriImport | undefined}
 */
module.exports = reader => {
	if (!reader.consumeOptional("#import"))
		return undefined;

	reader.consume(":");

	/** @type {ChiriPath[]} */
	let paths = [];
	const multiline = consumeBlockStartOptional(reader);
	if (!multiline) {
		consumeWhiteSpaceOptional(reader);
		paths.push(consumePath());
	} else
		while (consumeNewBlockLineOptional(reader))
			paths.push(consumePath());

	return {
		type: "import",
		paths,
	};

	function consumePath () {
		const path = consumePathOptional(reader);
		if (!path)
			throw reader.error(reader.consumeOptional("./") ? "Remove the ./ from the start of this path"
				: "Expected path to import");

		return path;
	}
};
