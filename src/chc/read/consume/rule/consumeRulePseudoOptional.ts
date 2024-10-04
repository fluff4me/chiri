import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import type { ChiriComponentPseudo } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponentPseudo | undefined> => {
	const position = reader.getPosition()
	const e = reader.i
	const pseudos: ChiriWord[] = []
	do {
		const prefix = reader.consumeOptional("@")
		if (!prefix)
			break

		pseudos.push(consumeWord(reader, "before", "after"))
	} while (reader.consumeOptional(",") && (consumeWhiteSpaceOptional(reader) || true))

	if (!pseudos.length)
		return undefined

	const duplicates = new Set(pseudos.map(e => e.value))
	if (pseudos.length > 2 || duplicates.size !== pseudos.length)
		throw reader.error(e, "Duplicate pseudoelement selector")

	reader.consume(":")

	return {
		type: "component",
		subType: "pseudo",
		pseudos,
		...await consumeBody(reader, "pseudo"),
		position,
	}
}
