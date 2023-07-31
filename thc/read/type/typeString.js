// @ts-check

const assertNotWhiteSpaceAndNewLine = require("../assert/assertNotWhiteSpaceAndNewLine");
const consumeBlockEnd = require("../consume/consumeBlockEnd");
const consumeBlockStartOptional = require("../consume/consumeBlockStartOptional");
const consumeIndentOptional = require("../consume/consumeIndentOptional");
const consumeNewBlockLineOptional = require("../consume/consumeNewBlockLineOptional");
const consumeWordOptional = require("../consume/consumeWordOptional");

/** @type {import("../ThetaTypeManager").ThetaTypeDefinition} */
module.exports = {
	stringable: true,
	/** @returns {ThetaLiteralString | undefined} */
	consumeOptionalConstructor (reader) {
		const s = reader.i;
		if (!reader.consumeOptional('"'))
			return undefined;

		assertNotWhiteSpaceAndNewLine(reader);

		const block = consumeBlockStartOptional(reader);

		/** @type {ThetaLiteralString["segments"]} */
		const segments = [""];
		String: for (; reader.i < reader.input.length; reader.i++) {
			if (block)
				segments[segments.length - 1] += "\\n".repeat(consumeNewBlockLineOptional(reader, true));

			const char = reader.input[reader.i];
			switch (char) {
				case "\\":
					reader.i++;
					if (consumeNewBlockLineOptional(reader, true)) {
						consumeIndentOptional(reader);
						reader.i--;
						break;
					}

					const escapeChar = reader.input[reader.i];
					switch (escapeChar) {
						case "r":
						case "n":
						case "t":
						case "\\":
						case "$":
							segments[segments.length - 1] += char + escapeChar;
							break;
						case '"':
							segments[segments.length - 1] += escapeChar;
							break;
						default:
							throw reader.error("Unexpected escape character");
					}
					break;
				case "$":
				case "`":
					segments[segments.length - 1] += `\\${char}`;
					break;
				case "*":
					const e = reader.i;
					reader.i++;
					const word = consumeWordOptional(reader);
					if (!word) {
						reader.i--;
						segments[segments.length - 1] += "*";
						break;
					}

					reader.i--;
					const type = reader.getDeclaration(word.value).valueType;
					if (!reader.getType(type).stringable)
						throw reader.error(e, `Type '${type}' is not stringable`);

					segments.push({
						type: "get",
						valueType: type,
						name: word,
					}, "");
					break;
				case "\r":
					break;
				case "\n":
					break String;
				case "\t":
					segments[segments.length - 1] += "\\t";
					break;
				default:
					segments[segments.length - 1] += char;
			}
		}


		if (block)
			consumeBlockEnd(reader);

		return {
			type: "literal",
			subType: "string",
			segments,
		};
	}
};
