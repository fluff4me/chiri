

import ChiriReader from "../ChiriReader";
import consumeCommentOptional from "../consume/consumeCommentOptional";

export default (reader: ChiriReader, message = "Expected newline") => {
	const savedPosition = reader.savePosition();

	consumeCommentOptional(reader);
	while (reader.consumeOptional("\r"));
	if (!reader.consumeOptional("\n"))
		throw reader.error(message);

	reader.restorePosition(savedPosition);
};
