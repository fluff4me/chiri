import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import consumeWordInterpolated from "../consumeWordInterpolated"
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional"
import type { ChiriComponent, ChiriComponentCustomState, ChiriComponentDescendantElement } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponent | ChiriComponentCustomState | ChiriComponentDescendantElement | undefined> => {
	if (reader.context.type === "mixin")
		return undefined

	const position = reader.getPosition()

	const names: ChiriWordInterpolated[] = []

	let validPrefixes: ("&--" | "&-" | "& " | "&& " | ".")[] = reader.context.type === "component" ? ["&--", "&-", "& ", "&& "] : ["."]
	do {
		const prefix = reader.consumeOptional(...validPrefixes)
		if (!prefix)
			return undefined

		validPrefixes = [prefix] // only allow one kind of prefix
		names.push(consumeWordInterpolated(reader, true))
	} while (reader.consumeOptional(",") && (consumeWhiteSpaceOptional(reader) || true))

	reader.consume(":")

	return {
		type: "component",
		subType: validPrefixes[0].endsWith("& ") ? "element" : validPrefixes[0] === "&--" ? "custom-state" : "component",
		spread: validPrefixes[0] === "&& " ? true : undefined,
		names,
		...await consumeBody(reader, "component"),
		position,
	} as ChiriComponent
}
