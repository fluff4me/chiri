

import ChiriReader from "../ChiriReader";
import consumeWordOptional from "../consume/consumeWordOptional";

export default (reader: ChiriReader) => {
	const savedPosition = reader.savePosition();

	if (!consumeWordOptional(reader))
		return false;

	const result = reader.consumeOptional("=", "\r\n", " ");
	reader.restorePosition(savedPosition);
	return result;
};
