

import { ChiriMixin } from "../../ChiriAST";
import ChiriReader from "../ChiriReader";
import consumeBody from "./consumeBody";
import consumeWord from "./consumeWord";

export default async (reader: ChiriReader): Promise<ChiriMixin | undefined> => {
	const savedPosition = reader.savePosition();
	if (!reader.consumeOptional("%"))
		return undefined;

	const name = consumeWord(reader);

	if (!reader.consumeOptional(":")) {
		reader.restorePosition(savedPosition);
		return undefined;
	}

	return {
		type: "mixin",
		name,
		used: false,
		...await consumeBody(reader, "mixin"),
	}
};
