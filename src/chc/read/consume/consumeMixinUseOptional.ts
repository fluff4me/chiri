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

	const mixin = reader.getMixinOptional(word.value)
	if (!mixin)
		throw reader.error(start, `No declaration for %${word.value}`)

	if (reader.getStatements().some(statement => statement.type === "mixin-use" && statement.name.value === word.value))
		throw reader.error(start, `%${word.value} is already included in this context`)

	// const assignments = consumeFunctionParameters(reader, start, mixin)

	assertNewLine(reader)

	return {
		type: "mixin-use",
		name: word,
		assignments: {},
		position,
	}
}
