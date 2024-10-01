import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeWordInterpolated from "../consumeWordInterpolated"
import type { ChiriComponent } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponent | undefined> => {
	if (reader.context.type === "mixin")
		return undefined

	const position = reader.getPosition()
	const prefix = reader.consumeOptional(reader.context.type === "component" ? "&-" : ".")
	if (!prefix)
		return undefined

	const className = consumeWordInterpolated(reader, prefix === "&-")
	reader.consume(":")

	return {
		type: "component",
		className,
		state: undefined,
		...await consumeBody(reader, "component"),
		position,
	}
}
