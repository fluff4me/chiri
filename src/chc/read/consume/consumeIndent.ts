

import ChiriReader from "../ChiriReader";
import consumeIndentOptional from "./consumeIndentOptional";

export default (reader: ChiriReader, expected?: number) => {
	const result = consumeIndentOptional(reader, expected);
	if (result === undefined) {
		if (reader.consumeOptional("  "))
			throw reader.error("Indentation must be with tab characters");

		throw reader.error("Not enough indentation");
	}
	return result;
};
