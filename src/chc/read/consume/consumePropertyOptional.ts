import { ChiriProperty } from "../../ChiriAST";
import ChiriReader from "../ChiriReader";
import consumeBlockStartOptional from "./consumeBlockStartOptional";
import consumeValue from "./consumeValue";
import consumeWhiteSpace from "./consumeWhiteSpace";
import consumeWordInterpolated from "./consumeWordInterpolated";

export default (reader: ChiriReader): ChiriProperty | undefined => {
	if (!reader.isLetter() && reader.input[reader.i] !== "$" && reader.input[reader.i] !== "#")
		return undefined;

	if (reader.input[reader.i] === "#" && reader.input[reader.i + 1] !== "{")
		return undefined;

	const position = reader.getPosition();
	const isCustomProperty = reader.consumeOptional("$");

	const property = consumeWordInterpolated(reader);

	reader.consume(":");
	consumeWhiteSpace(reader);

	const value = consumeValue(reader, !!consumeBlockStartOptional(reader));

	return {
		type: "property",
		isCustomProperty: isCustomProperty ? true : undefined,
		position,
		property,
		value,
	};
};
