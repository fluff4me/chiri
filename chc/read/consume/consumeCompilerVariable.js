// @ts-check

const consumeExpression = require("./consumeExpression");
const { consumeType } = require("./consumeType");
const consumeWhiteSpace = require("./consumeWhiteSpace");
const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");
const consumeWord = require("./consumeWord");
const consumeWordOptional = require("./consumeWordOptional");

/** 
 * @param {import("../ChiriReader")} reader 
 * @returns {ChiriCompilerVariable}
 */
module.exports = reader => {
	const position = reader.getPosition();
	let e = reader.i;
	reader.consume("#");

	const varWord = consumeWordOptional(reader, "var");
	/** @type {ChiriType} */
	const type = !varWord ? consumeType(reader)
		: {
			type: "type",
			name: { ...varWord, value: "*" },
			generics: [],
		};

	consumeWhiteSpace(reader);

	const name = consumeWord(reader);

	const postType = reader.i;

	if (type)
		consumeWhiteSpaceOptional(reader);

	/** @type {ChiriExpressionOperand | undefined} */
	let expression;
	if (reader.consumeOptional("??=")) {
		consumeWhiteSpaceOptional(reader);
		expression = consumeExpression(reader, type.name.value);
	} else {
		reader.i = postType;
	}

	return {
		type: "variable",
		valueType: type?.name.value ?? "*",
		name,
		expression,
		position,
	}
};
