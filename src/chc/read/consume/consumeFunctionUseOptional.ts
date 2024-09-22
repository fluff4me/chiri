import type { ChiriFunctionUse } from "../../ChiriAST"
import getFunctionParameters from "../../util/getFunctionParameters"
import type ChiriReader from "../ChiriReader"
import type { ChiriContext } from "./body/Contexts"
import consumeBodyOptional from "./consumeBodyOptional"
import consumeFunctionParameters from "./consumeFunctionParameters"
import consumeWordOptional from "./consumeWordOptional"

export default async (reader: ChiriReader, context: ChiriContext): Promise<ChiriFunctionUse | undefined> => {
	const position = reader.savePosition()
	if (!reader.consumeOptional("#"))
		return undefined

	const word = consumeWordOptional(reader)
	const fn = word?.value && reader.getFunction(word.value)
	if (!fn) {
		reader.restorePosition(position)
		return undefined
	}

	const assignments = consumeFunctionParameters(reader, position.i, fn)

	const bodyParameter = getFunctionParameters(fn)
		.sort((a, b) => +!!a.expression - +!!b.expression)
		.find(parameter => parameter.valueType.name.value === "body")

	const body = bodyParameter && await consumeBodyOptional(reader, bodyParameter.valueType.generics[0].name.value as ChiriContext)

	return {
		type: "function-use",
		name: word,
		variables: assignments,
		content: body ?? [],
	}
}
