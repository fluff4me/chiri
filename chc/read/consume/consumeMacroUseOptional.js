const ChiriReader = require("../ChiriReader");
const consumeCompilerVariable = require("./consumeCompilerVariableOptional");
const consumeWordOptional = require("./consumeWordOptional");
const macroDebug = require("./macro/macroDebug");
const macroFunction = require("./macro/macroFunction");
const macroImport = require("./macro/macroImport");
const macroOnce = require("./macro/macroOnce");

/**
 * @param {ChiriReader} reader 
 */
module.exports = async reader => {
	if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] === "{")
		return undefined;

	if (macroOnce(reader))
		return undefined;

	const result = undefined
		?? macroImport(reader)
		?? macroDebug(reader)
		?? await macroFunction(reader)
		?? consumeCompilerVariable(reader)

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
