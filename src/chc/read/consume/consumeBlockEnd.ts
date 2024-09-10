

import ChiriReader from "../ChiriReader";
import consumeIndent from "./consumeIndent";
import consumeNewLineOptional from "./consumeNewLineOptional";

export default (reader: ChiriReader) => {
	const savedPosition = reader.savePosition();
	reader.indent--;
	let consumed = false;
	while (consumeNewLineOptional(reader)) consumed = true;

	if (!consumed)
		throw reader.error("Expected end of block");

	const e = reader.i;
	const consumedIndent = consumeIndent(reader);
	if (consumedIndent > reader.indent)
		throw reader.error(e, "Too much indentation");

	reader.restorePosition(savedPosition);
	return true;
};
