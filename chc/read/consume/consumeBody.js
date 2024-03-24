const ChiriReader = require("../ChiriReader");
const assertNotWhiteSpaceAndNewLine = require("../assert/assertNotWhiteSpaceAndNewLine");
const consumeBlockStartOptional = require("./consumeBlockStartOptional");
const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");

/**
 * @param {ChiriReader} reader
 * @param {(sub: ChiriReader) => any=} initialiser
 * @returns {Promise<ChiriBody>} 
 */
module.exports = async (reader, initialiser) => {
	assertNotWhiteSpaceAndNewLine(reader);

	const multiline = consumeBlockStartOptional(reader);
	const whitespace = multiline || consumeWhiteSpaceOptional(reader);
	if (!whitespace)
		return {
			content: [],
		};

	const sub = reader.sub(multiline);
	initialiser?.(sub);
	const ast = await sub.read();
	const content = ast.statements;
	reader.update(sub);
	return {
		content,
	};
};
