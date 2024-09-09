// @ts-check

const consumeExpression = require("./consumeExpression");
const { consumeType, consumeTypeOptional } = require("./consumeType");
const consumeWhiteSpace = require("./consumeWhiteSpace");
const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");
const consumeWord = require("./consumeWord");
const consumeWordOptional = require("./consumeWordOptional");

/** 
 * @param {import("../ChiriReader")} reader 
 * @returns {ChiriCompilerVariable | undefined}
 */
module.exports = reader => {
	const save = reader.savePosition();
	const position = reader.getPosition();
	let e = reader.i;
	reader.consume("#");

	const varWord = consumeWordOptional(reader, "var");
	/** @type {ChiriType | undefined} */
	const type = !varWord ? consumeTypeOptional(reader)
		: {
			type: "type",
			name: { ...varWord, value: "*" },
			generics: [],
		};

	if (!type) {
		reader.restorePosition(save);
		return undefined;
	}

	consumeWhiteSpace(reader);

	const name = consumeWord(reader);

	const postType = reader.i;

	if (type)
		consumeWhiteSpaceOptional(reader);

	const assignment = /** @type {"??=" | "=" | undefined} */(reader.consumeOptional("??=", "="));

	/** @type {ChiriExpressionOperand | undefined} */
	let expression;
	if (assignment) {
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
		assignment,
	}
};
