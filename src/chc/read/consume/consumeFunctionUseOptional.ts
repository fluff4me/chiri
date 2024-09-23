import getFunctionParameters from "../../util/getFunctionParameters"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition, ChiriStatement } from "../ChiriReader"
import type { ChiriContext } from "./body/Contexts"
import consumeBodyOptional from "./consumeBodyOptional"
import type { ChiriExpressionOperand } from "./consumeExpression"
import consumeFunctionParameters from "./consumeFunctionParameters"
import type { ChiriWord } from "./consumeWord"
import consumeWordOptional from "./consumeWordOptional"

export interface ChiriFunctionUse {
	type: "function-use"
	name: ChiriWord
	assignments: Record<string, ChiriExpressionOperand>
	content: ChiriStatement[]
	position: ChiriPosition
}

export default async (reader: ChiriReader, context: ChiriContext): Promise<ChiriFunctionUse | undefined> => {
	const position = reader.getPosition()
	const restore = reader.savePosition()
	if (!reader.consumeOptional("#"))
		return undefined

	const word = consumeWordOptional(reader)
	const fn = word?.value && reader.getFunction(word.value)
	if (!fn) {
		reader.restorePosition(restore)
		return undefined
	}

	const assignments = consumeFunctionParameters(reader, restore.i, fn)

	const bodyParameter = getFunctionParameters(fn)
		.sort((a, b) => +!!a.expression - +!!b.expression)
		.find(parameter => parameter.valueType.name.value === "body")

	const body = bodyParameter && await consumeBodyOptional(reader, bodyParameter.valueType.generics[0].name.value as ChiriContext)

	return {
		type: "function-use",
		name: word,
		assignments,
		content: body ?? [],
		position,
	}
}
