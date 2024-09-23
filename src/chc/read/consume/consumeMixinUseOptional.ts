import assertNewLine from "../assert/assertNewLine"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import type { ChiriExpressionOperand } from "./consumeExpression"
import type { ChiriWord } from "./consumeWord"
import consumeWordOptional from "./consumeWordOptional"

export interface ChiriMixinUse {
	type: "mixin-use"
	name: ChiriWord
	assignments: Record<string, ChiriExpressionOperand>
	position: ChiriPosition
}

export default (reader: ChiriReader): ChiriMixinUse | undefined => {
	const position = reader.getPosition()
	const start = reader.i
	if (!reader.consumeOptional("%"))
		return undefined

	const word = consumeWordOptional(reader)
	if (!word)
		return undefined

	const mixin = reader.getMixin(word.value)
	if (!mixin)
		throw reader.error(start, `No declaration for %${word.value}`)

	// const assignments = consumeFunctionParameters(reader, start, mixin)

	assertNewLine(reader)

	mixin.used = true
	return {
		type: "mixin-use",
		name: word,
		assignments: {},
		position,
	}
}
