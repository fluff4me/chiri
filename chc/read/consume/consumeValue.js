// @ts-check

const consumeExpression = require("./consumeExpression");
const consumeNewBlockLineOptional = require("./consumeNewBlockLineOptional");
const consumeWord = require("./consumeWord");
const consumeWordInterpolated = require("./consumeWordInterpolated");

/** 
 * @param {import("../ChiriReader")} reader
 * @param {boolean} multiline
 * @returns {ChiriValueText}
 */
module.exports = (reader, multiline) => {
	const e = reader.i;
	const start = reader.getPosition();

	/** @type {ChiriValueText["content"]} */
	const content = [];

	let textStart = start;
	let text = "";
	for (; reader.i < reader.input.length; reader.i++) {
		if (reader.input[reader.i] === "\n") {
			if (!multiline || !consumeNewBlockLineOptional(reader))
				break;

			text += " ";
			continue;
		}

		if (reader.input[reader.i] === "\r")
			continue;

		const varType = reader.consumeOptional("#{", "$");
		if (!varType) {
			text += reader.input[reader.i];
			continue;
		}

		if (text) {
			content.push({
				type: "text-raw",
				position: textStart,
				text,
			});
		}

		if (varType === "$") {
			const property = consumeWordInterpolated(reader);
			content.push({
				type: "interpolation-property",
				name: property,
				position: property.position,
			});

		} else {
			content.push(consumeExpression(reader));
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
		position: start,
	};
};
