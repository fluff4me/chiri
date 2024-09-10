

import ChiriReader from "../ChiriReader";
import consumeNewLineOptional from "../consume/consumeNewLineOptional";
import consumeWhiteSpaceOptional from "../consume/consumeWhiteSpaceOptional";

export default (reader: ChiriReader) => {
	const s = reader.i;
	const savedPosition = reader.savePosition();
	if (!consumeWhiteSpaceOptional(reader))
		return;

	const e = reader.i;
	if (consumeNewLineOptional(reader)) {
		reader.i = e;
		throw reader.error(s, "Extraneous whitespace before newline");
	}

	reader.restorePosition(savedPosition);
};
