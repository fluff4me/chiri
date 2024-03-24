// @ts-check

const consumeExpression = require("./consumeExpression");
const consumeWord = require("./consumeWord");

/** 
 * @param {import("../ChiriReader")} reader
 * @returns {ChiriText}
 */
module.exports = reader => {
	const e = reader.i;

	if (!reader.isLetter() && !reader.consumeOptional("#"))
		throw reader.error("Words must start with a letter");

	/** @type {ChiriText["content"]} */
	const content = [];

	let textStart = reader.getPosition();
	let text = reader.input[reader.i++];
	for (; reader.i < reader.input.length; reader.i++) {
		if (reader.isWordChar()) {
			text += reader.input[reader.i];
			continue;
		}

		if (reader.input[reader.i] !== "#")
			break;

		if (text)
			content.push({
				type: "text-raw",
				position: textStart,
				text,
			});

		if (reader.input[reader.i + 1] === "{") {
			reader.consume("#{");
			content.push(consumeExpression(reader));
		} else {
			const position = reader.getPosition();
			const word = consumeWord(reader);
			content.push({
				type: "interpolation-variable",
				name: word,
				position,
			})
		}

		text = "";
		textStart = reader.getPosition();
	}

	if (text)
		content.push({
			type: "text-raw",
			position: textStart,
			text,
		});

	return {
		type: "text",
		content,
		position: reader.getPosition(e),
	};
};
