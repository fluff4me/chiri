import _ from "../../../util/_"
import type ChiriReader from "../../ChiriReader"
import consumeBody from "../consumeBody"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWordOptional from "../consumeWordOptional"
import type { ChiriComponentPseudo, ChiriComponentViewTransition, ChiriComponentViewTransitionClass } from "./Rule"

export default async (reader: ChiriReader): Promise<ChiriComponentPseudo | ChiriComponentViewTransition | ChiriComponentViewTransitionClass | undefined> => {
	const position = reader.getPosition()
	const e = reader.i

	const result = _
		?? consumePseudoType(reader, "view-transition", "view-transition!old", "view-transition!new", "view-transition!image-pair")
		?? consumePseudoType(reader, "view-transition-class", "view-transition-class!old", "view-transition-class!new", "view-transition-class!group", "view-transition-class!image-pair")
		?? consumePseudoType(reader, "pseudo", "before", "after", "view-transition", "backdrop", "range-thumb", "range-track", "placeholder", "details-content", "swatch-wrapper", "swatch")
	if (!result)
		return undefined

	const duplicates = new Set(result.pseudos.map(e => e.value))
	if (result.pseudos.length > 2 || duplicates.size !== result.pseudos.length)
		throw reader.error(e, "Duplicate pseudoelement selector")

	reader.consume(":")

	return {
		type: "component",
		subType: result.type,
		spread: result.spread,
		pseudos: result.pseudos as ChiriWord<any>[],
		...await consumeBody(reader, "pseudo"),
		position,
	}
}

function consumePseudoType<TYPE extends string, PSEUDOS extends string[]> (reader: ChiriReader, type: TYPE, ...pseudos: PSEUDOS): { type: TYPE, pseudos: ChiriWord<PSEUDOS[number]>[], spread: boolean } | undefined {
	const restore = reader.savePosition()

	let prefix: "@" | "&@" | undefined
	const results: ChiriWord<PSEUDOS[number]>[] = []
	do {
		const thisPrefix = prefix ? reader.consumeOptional(prefix) : reader.consumeOptional("@", "&@")
		if (!thisPrefix)
			break

		prefix = thisPrefix

		const word = consumeWordOptional(reader, ...pseudos)
		if (!word) {
			reader.restorePosition(restore)
			return undefined
		}

		results.push(word)
	} while (reader.consumeOptional(",") && (consumeWhiteSpaceOptional(reader) || true))

	if (!results.length) {
		reader.restorePosition(restore)
		return undefined
	}

	return {
		type,
		spread: prefix === "&@",
		pseudos: results,
	}
}
