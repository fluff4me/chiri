import { ChiriImport, ChiriPath } from "../../../ChiriAST";
import ChiriReader from "../../ChiriReader";
import consumeBlockStartOptional from "../consumeBlockStartOptional";
import consumeNewBlockLineOptional from "../consumeNewBlockLineOptional";
import consumePathOptional from "../consumePathOptional";
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional";

export default (reader: ChiriReader): ChiriImport | undefined => {
	if (!reader.consumeOptional("#import"))
		return undefined;

	reader.consume(":");

	let paths: ChiriPath[] = [];
	const multiline = consumeBlockStartOptional(reader);
	if (!multiline) {
		consumeWhiteSpaceOptional(reader);
		paths.push(consumePath());
	} else
		while (consumeNewBlockLineOptional(reader))
			paths.push(consumePath());

	return {
		type: "import",
		paths,
	};

	function consumePath () {
		const path = consumePathOptional(reader);
		if (!path)
			throw reader.error(reader.consumeOptional("./") ? "Remove the ./ from the start of this path"
				: "Expected path to import");

		return path;
	}
};
