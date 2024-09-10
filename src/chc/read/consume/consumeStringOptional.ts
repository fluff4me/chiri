import { ChiriLiteralString } from "../../ChiriAST";
import assertNotWhiteSpaceAndNewLine from "../assert/assertNotWhiteSpaceAndNewLine";
import ChiriReader from "../ChiriReader";
import consumeBlockEnd from "./consumeBlockEnd";
import consumeBlockStartOptional from "./consumeBlockStartOptional";
import consumeIndentOptional from "./consumeIndentOptional";
import consumeNewBlockLineOptional from "./consumeNewBlockLineOptional";
import consumeWordOptional from "./consumeWordOptional";

export default (reader: ChiriReader): ChiriLiteralString | undefined => {
	const s = reader.i;
	if (!reader.consumeOptional('"'))
		return undefined;

	assertNotWhiteSpaceAndNewLine(reader);

	const block = consumeBlockStartOptional(reader);

	const segments: ChiriLiteralString["segments"] = [""];
	let pendingNewlines = "";
	String: for (; reader.i < reader.input.length; reader.i++) {
		if (block)
			pendingNewlines += "\\n".repeat(consumeNewBlockLineOptional(reader, true));

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
						segments[segments.length - 1] += pendingNewlines + char + escapeChar;
						pendingNewlines = "";
						break;
					case '"':
						segments[segments.length - 1] += pendingNewlines + escapeChar;
						pendingNewlines = "";
						break;
					default:
						throw reader.error("Unexpected escape character");
				}
				break;
			case "$":
			case "`":
				segments[segments.length - 1] += pendingNewlines + `\\${char}`;
				pendingNewlines = "";
				break;
			case "*":
				const e = reader.i;
				reader.i++;
				const word = consumeWordOptional(reader);
				if (!word) {
					reader.i--;
					segments[segments.length - 1] += pendingNewlines + "*";
					pendingNewlines = "";
					break;
				}

				reader.i--;
				const variable = reader.getVariable(word.value);
				if (!variable)
					throw reader.error(e, `Variable '${word.value}' has not been declared`);

				const type = variable.valueType;
				if (!type || !reader.getType(type).stringable)
					throw reader.error(e, `Type '${type}' is not stringable`);

				segments[segments.length - 1] += pendingNewlines;
				pendingNewlines = "";

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
				pendingNewlines += pendingNewlines + "\\t";
				break;
			case `"`:
				if (!block) {
					reader.i++;
					break String;
				}
			default:
				segments[segments.length - 1] += pendingNewlines + char;
				pendingNewlines = "";
		}
	}

	if (block)
		consumeBlockEnd(reader);

	return {
		type: "literal",
		subType: "string",
		segments,
	};
};
