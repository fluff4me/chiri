import _ from "../../util/_"
import type ChiriReader from "../ChiriReader"
import type { ChiriMacroUseContext, MacroResult } from "./consumeMacroUseOptional"
import consumeWordOptional from "./consumeWordOptional"
import macroDo from "./macro/macroDo"
import macroEach from "./macro/macroEach"
import macroFor from "./macro/macroFor"
import macroIf, { macroElse, macroIfElse } from "./macro/macroIf"
import macroWhile from "./macro/macroWhile"

export default async function consumeMacroBlockUseOptional (reader: ChiriReader, context: ChiriMacroUseContext): Promise<MacroResult | undefined> {
	const savedPosition = reader.savePosition()

	const label = consumeLabelOptional(reader)

	const result = _
		?? await macroDo.consumeOptional(reader, ...context)
		?? await macroEach.consumeOptional(reader, ...context)
		?? await macroIf.consumeOptional(reader, ...context)
		?? await macroIfElse.consumeOptional(reader, ...context)
		?? await macroElse.consumeOptional(reader, ...context)
		?? await macroFor.consumeOptional(reader, ...context)
		?? await macroWhile.consumeOptional(reader, ...context)

	if (!result) {
		reader.restorePosition(savedPosition)
		return undefined
	}

	result.label = label
	return result
}

function consumeLabelOptional (reader: ChiriReader) {
	const savedPosition = reader.savePosition()
	if (!reader.consumeOptional("#:"))
		return undefined

	const label = consumeWordOptional(reader)
	if (!label?.value)
		return undefined

	if (!reader.consumeOptional(" ")) {
		reader.restorePosition(savedPosition)
		return undefined
	}

	return label
}
