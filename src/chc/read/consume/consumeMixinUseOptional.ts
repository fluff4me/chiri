import type { ChiriMixinUse } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import consumeFunctionParameters from "./consumeFunctionParameters"
import consumeWordOptional from "./consumeWordOptional"

export default (reader: ChiriReader): ChiriMixinUse | undefined => {
	const start = reader.i
	if (!reader.consumeOptional("%"))
		return undefined

	const word = consumeWordOptional(reader)
	if (!word)
		return undefined

	const mixin = reader.getMixin(word.value)
	if (!mixin)
		throw reader.error(start, `No declaration for %${word.value}`)

	const assignments = consumeFunctionParameters(reader, start, mixin)

	// if ()

	mixin.used = true
	return {
		type: "mixin-use",
		name: word,
		variables: assignments,
	}
}
