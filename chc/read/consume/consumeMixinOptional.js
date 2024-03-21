// @ts-check

const consumeWhiteSpaceOptional = require("./consumeWhiteSpaceOptional");
const consumeWord = require("./consumeWord");
const consumeCompilerVariable = require("./consumeCompilerVariable");
const consumeBody = require("./consumeBody");

/** 
 * @param {import("../ChiriReader")} reader 
 * @returns {ChiriMixin | undefined}
 */
module.exports = reader => {
	const savedPosition = reader.savePosition();
	if (!reader.consumeOptional("%"))
		return undefined;

	const name = consumeWord(reader);

	consumeWhiteSpaceOptional(reader);

	const parenthesised = reader.consumeOptional("(");

	const parameters = [];
	let usingCommas = false;
	while (true) {
		let consumedComma = false;
		if (parameters.length === 1 || usingCommas)
			if (consumedComma = !!reader.consumeOptional(","))
				usingCommas = true;

		const commapos = reader.i;

		consumeWhiteSpaceOptional(reader);

		let vs = reader.i;
		if (!reader.consumeOptional("#"))
			break;

		if (!consumedComma && usingCommas)
			throw reader.error(reader.i = commapos, `Expected comma`);

		reader.i = vs;

		const variable = consumeCompilerVariable(reader);
		parameters.push(variable);
	}

	if (parenthesised && !reader.consumeOptional(")"))
		throw reader.error("Expected closing parenthesis");

	if (!reader.consumeOptional(":")) {
		if (parameters.length || parenthesised)
			throw reader.error("Expected :");

		reader.restorePosition(savedPosition);
		return undefined;
	}

	return {
		type: "mixin",
		name,
		...consumeBody(reader),
	}
};
