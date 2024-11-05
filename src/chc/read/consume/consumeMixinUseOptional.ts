import assertNewLine from "../assert/assertNewLine"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional"
import consumeWordInterpolatedOptional from "./consumeWordInterpolatedOptional"

export interface ChiriMixinUse {
	type: "mixin-use"
	name: ChiriWordInterpolated
	spread?: true
	// assignments: Record<string, ChiriExpressionOperand>
	position: ChiriPosition
}

export default (reader: ChiriReader): ChiriMixinUse | undefined => {
	const position = reader.getPosition()
	const start = reader.i

	const operator = reader.consumeOptional("%", "..%")
	if (!operator)
		return undefined

	const word = consumeWordInterpolatedOptional(reader)
	if (!word)
		return undefined

	assertNewLine(reader)

	return {
		type: "mixin-use",
		name: word,
		spread: operator === "..%" ? true : undefined,
		// assignments: {},
		position,
	}
}
