

import { ChiriLiteralNumeric } from "../../ChiriAST";
import ChiriReader from "../ChiriReader";
import consumeUnsignedIntegerOptional from "./consumeUnsignedIntegerOptional";

export default (reader: ChiriReader): ChiriLiteralNumeric | undefined => {
	const e = reader.i;
	const position = reader.getPosition();
	const negative = reader.consumeOptional("-") ?? "";

	const int = consumeUnsignedIntegerOptional(reader);
	if (int === undefined) {
		reader.i = e;
		return undefined;
	}

	if (!reader.consumeOptional(".")) {
		reader.i = e;
		return undefined;
	}

	const dec = consumeUnsignedIntegerOptional(reader);
	if (!dec) {
		reader.i = e;
		return undefined;
	}

	return {
		type: "literal",
		subType: "dec",
		value: `${negative}${int.value}.${dec.value}`,
		position,
	};
};
