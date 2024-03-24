// @ts-check

const consumeExpression = require("./consumeExpression");
const consumeNewBlockLineOptional = require("./consumeNewBlockLineOptional");
const consumeWord = require("./consumeWord");

/** 
 * @param {import("../ChiriReader")} reader
 * @param {boolean} multiline
 * @returns {ChiriText}
 */
module.exports = (reader, multiline) => {
	const e = reader.i;
	const start = reader.getPosition();

	/** @type {ChiriText["content"]} */
	const content = [];

	let textStart = start;
	let text = reader.input[reader.i++];
	for (; reader.i < reader.input.length; reader.i++) {
		if (reader.input[reader.i] === "\n") {
			if (!multiline || !consumeNewBlockLineOptional(reader))
				break;

			text += " ";
			continue;
		}

		if (reader.input[reader.i] === "\r")
			continue;

		if (reader.input[reader.i] !== "#") {
			text += reader.input[reader.i];
			continue;
		}

		if (text)
			content.push({
				type: "text-raw",
				position: textStart,
				text,
			});

		if (reader.input[reader.i + 1] === "{") {
			reader.consume("#{");
			content.push(consumeExpression(reader));
		}
		// else {
		// 	const position = reader.getPosition();
		// 	const word = consumeWord(reader);
		// 	content.push({
		// 		type: "interpolation-variable",
		// 		name: word,
		// 		position,
		// 	})
		// }

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
		position: start,
	};
};
