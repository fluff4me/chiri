

import ChiriReader from "../ChiriReader";
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional";

export default (reader: ChiriReader): true => {
	if (!consumeWhiteSpaceOptional(reader))
		throw reader.error("Expected whitespace");
	return true;
};
