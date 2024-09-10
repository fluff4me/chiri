import { ChiriRule } from "../../ChiriAST";
import ChiriReader from "../ChiriReader";
import consumeBody from "./consumeBody";
import consumeWordInterpolated from "./consumeWordInterpolated";

export default async (reader: ChiriReader): Promise<ChiriRule | undefined> => {
	if (reader.context === "mixin")
		return undefined;

	const prefix = reader.consumeOptional(reader.context === "rule" ? "&-" : ".");
	if (!prefix)
		return undefined;

	const className = consumeWordInterpolated(reader);
	reader.consume(":");

	return {
		type: "rule",
		className,
		state: undefined,
		...await consumeBody(reader, "rule"),
	}
};
