import type ChiriReader from "../ChiriReader"
import consumeCompilerVariable from "./consumeCompilerVariableOptional"
import consumeWordOptional from "./consumeWordOptional"
import macroDebug from "./macro/macroDebug"
import macroFunction from "./macro/macroFunction"
import macroImport from "./macro/macroImport"
import macroOnce from "./macro/macroOnce"

export default async (reader: ChiriReader) => {
	if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] === "{")
		return undefined

	if (macroOnce(reader))
		return undefined

	const result = undefined
		?? macroImport(reader)
		?? macroDebug(reader)
		?? await macroFunction(reader)
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
