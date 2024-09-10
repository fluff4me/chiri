

import { ChiriType } from "../../ChiriAST";
import ChiriReader from "../ChiriReader";
import consumeTypeConstructorOptional from "./consumeTypeConstructorOptional";

export default (reader: ChiriReader, type: ChiriType) => {
	let e = reader.i;
	const result = consumeTypeConstructorOptional(reader, type);
	if (result === undefined)
		throw reader.error(e, `Expected '${type.name.value}' constructor`);

	return result;
};
