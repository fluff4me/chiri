const ChiriReader = require("../ChiriReader");
const consumeCompilerVariable = require("./consumeCompilerVariableOptional");
const consumeWordOptional = require("./consumeWordOptional");

/**
 * @param {ChiriReader} reader 
 */
module.exports = reader => {
	if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] === "{")
		return undefined;

	const result = consumeCompilerVariable(reader);
	if (!result) {
		const saved = reader.savePosition();
		const e = reader.i;
		reader.consume("#");
		const word = consumeWordOptional(reader);
		if (word) {
			const i = reader.i;
			reader.restorePosition(saved);
			reader.i = i;
			throw reader.error(e, "Unknown macro command");
		}

		reader.restorePosition(saved);
		throw reader.error("Indecipherable macro syntax");
	}

	return result;
};
