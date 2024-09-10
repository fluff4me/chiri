

import ChiriReader from "../ChiriReader";
import consumeWordOptional from "./consumeWordOptional";

export default (reader: ChiriReader) => {
	const e = reader.i;

	const type = consumeWordOptional(reader, "[]") // internal array type
		?? consumeWordOptional(reader, "{}") // internal object type
		?? consumeWordOptional(reader);

	if (!type)
		return undefined;

	if (!reader.getTypeOptional(type.value))
		return undefined;
	// throw reader.error(e, "There is no type '" + type.value + "'");

	return type;
};
