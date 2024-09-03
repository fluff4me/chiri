const ChiriReader = require("../ChiriReader");
const assertNotWhiteSpaceAndNewLine = require("../assert/assertNotWhiteSpaceAndNewLine");
const consumeBlockStartOptional = require("./consumeBlockStartOptional");
const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");

/**
 * @param {ChiriReader} reader
 * @param {ChiriContext} context
 * @param {(sub: ChiriReader) => any=} initialiser
 * @returns {Promise<ChiriBody>} 
 */
module.exports = async (reader, context, initialiser) => {
	assertNotWhiteSpaceAndNewLine(reader);

	const multiline = consumeBlockStartOptional(reader);
	const whitespace = multiline || consumeWhiteSpaceOptional(reader);
	if (!whitespace)
		return {
			content: [],
		};

	if (reader.peek("\r\n", "\n"))
		throw reader.error(reader.i - reader.getColumnNumber(), "Unexpected indentation on empty line");

	const sub = reader.sub(multiline, context);
	initialiser?.(sub);
	const ast = await sub.read();
	const content = ast.statements;
	reader.update(sub);
	return {
		content,
	};
};
