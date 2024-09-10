

import { ChiriWord } from "../../ChiriAST";
import ChiriReader from "../ChiriReader";
import consumeWord from "./consumeWord";

export default (reader: ChiriReader, expectedWord?: string): ChiriWord | undefined => {
	if (expectedWord) {
		const e = reader.i;
		const word = reader.consumeOptional(expectedWord);
		return !word ? undefined : {
			type: "word",
			value: word,
			position: reader.getPosition(e),
		};
	}

	return !expectedWord && !reader.isLetter() ? undefined : consumeWord(reader, expectedWord);
};
