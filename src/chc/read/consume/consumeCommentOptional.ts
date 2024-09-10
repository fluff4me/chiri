

import ChiriReader from "../ChiriReader";
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional";

export default (reader: ChiriReader) => {
	const e = reader.i;
	consumeWhiteSpaceOptional(reader, false);
	if (!reader.consumeOptional("; ")) {
		reader.i = e;
		return false;
	}

	for (; reader.i < reader.input.length; reader.i++)
		if (reader.input[reader.i] === "\n")
			break;

	return true;
};
