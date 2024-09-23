import assertNewLine from "../assert/assertNewLine"
import type ChiriReader from "../ChiriReader"
import type { ChiriExpressionOperand } from "./consumeExpression"
import consumeFunctionParameters from "./consumeFunctionParameters"
import type { ChiriWord } from "./consumeWord"
import consumeWordOptional from "./consumeWordOptional"

export interface ChiriMixinUse {
	type: "mixin-use"
	name: ChiriWord
	variables: Record<string, ChiriExpressionOperand>
}

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

	assertNewLine(reader)

	mixin.used = true
	return {
		type: "mixin-use",
		name: word,
		variables: assignments,
	}
}
