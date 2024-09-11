import type ChiriReader from "../ChiriReader"
import consumeCompilerVariable from "./consumeCompilerVariableOptional"
import consumeWordOptional from "./consumeWordOptional"
import macroDebug from "./macro/macroDebug"
import macroEach from "./macro/macroEach"
import macroFunctionDeclaration from "./macro/macroFunctionDeclaration"
import macroImport from "./macro/macroImport"
import macroOnce from "./macro/macroOnce"
import macroShorthand from "./macro/macroShorthand"

export default async (reader: ChiriReader) => {
	if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] === "{")
		return undefined

	if (await macroOnce.consumeOptional(reader))
		return undefined

	const result = undefined
		?? await macroImport.consumeOptional(reader)
		?? await macroDebug.consumeOptional(reader)
		?? await macroFunctionDeclaration.consumeOptional(reader)
		?? await macroShorthand.consumeOptional(reader)
		?? await macroEach.consumeOptional(reader)
		?? consumeCompilerVariable(reader)

	if (!result) {
		const saved = reader.savePosition()
		const e = reader.i
		reader.consume("#")
		const word = consumeWordOptional(reader)
		if (word) {
			const i = reader.i
			reader.restorePosition(saved)
			reader.i = i
			throw reader.error(e, "Unknown macro command")
		}

		reader.restorePosition(saved)
		throw reader.error("Indecipherable macro syntax")
	}

	return result
}
