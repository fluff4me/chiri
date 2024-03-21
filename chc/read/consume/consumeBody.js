const ChiriReader = require("../ChiriReader");
const assertNotWhiteSpaceAndNewLine = require("../assert/assertNotWhiteSpaceAndNewLine");
const consumeBlockStartOptional = require("./consumeBlockStartOptional");
const consumeIndentOptional = require("./consumeIndentOptional");
const consumeWhiteSpace = require("./consumeWhiteSpace");
const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");

/**
 * @param {ChiriReader} reader
 * @param {(sub: ChiriReader) => any=} initialiser
 * @returns {ChiriBody} 
 */
module.exports = (reader, initialiser) => {
	assertNotWhiteSpaceAndNewLine(reader);

	const multiline = consumeBlockStartOptional(reader);
	const whitespace = multiline || consumeWhiteSpaceOptional(reader);
	if (!whitespace)
		return {
			content: [],
		};

	const sub = reader.sub(multiline);
	initialiser?.(sub);
	const content = sub.read().statements;
	reader.update(sub);
	return {
		content,
	};
};
