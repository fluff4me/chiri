const ChiriReader = require("../ChiriReader");
const consumeCompilerVariable = require("./consumeCompilerVariable");

/**
 * @param {ChiriReader} reader 
 */
module.exports = reader => {
	if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] === "{")
		return;

	return consumeCompilerVariable(reader);
};
