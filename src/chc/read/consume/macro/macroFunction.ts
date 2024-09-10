

import { ChiriFunction } from "../../../ChiriAST";
import ChiriReader from "../../ChiriReader";
import consumeBody from "../consumeBody";
import consumeWord from "../consumeWord";

export default async (reader: ChiriReader): Promise<ChiriFunction | undefined> => {
	const savedPosition = reader.savePosition();
	if (!reader.consumeOptional("#function "))
		return undefined;

	const name = consumeWord(reader);

	if (!reader.consume(":")) {
		reader.restorePosition(savedPosition);
		return undefined;
	}

	return {
		type: "function",
		name,
		...await consumeBody(reader, "function"),
	}
};
