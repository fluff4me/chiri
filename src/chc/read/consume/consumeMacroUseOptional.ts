import type { ChiriCompilerVariable, ChiriFunction, ChiriFunctionUse, ChiriImport } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import type { BodyType } from "./body/BodyTypes"
import consumeCompilerVariable from "./consumeCompilerVariableOptional"
import consumeWordOptional from "./consumeWordOptional"
import macroDebug from "./macro/macroDebug"
import type { ChiriEach } from "./macro/macroEach"
import macroEach from "./macro/macroEach"
import macroFunctionDeclaration from "./macro/macroFunctionDeclaration"
import macroImport from "./macro/macroImport"
import macroOnce from "./macro/macroOnce"
import type { ChiriShorthand } from "./macro/macroShorthand"
import macroShorthand from "./macro/macroShorthand"

export type MacroResult =
	| ChiriCompilerVariable
	| ChiriFunction
	| ChiriFunctionUse
	| ChiriShorthand
	| ChiriImport
	| ChiriEach

export default async (reader: ChiriReader, bodyType: BodyType): Promise<MacroResult | undefined> => {
	if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] === "{")
		return undefined

	if (await macroOnce.consumeOptional(reader, bodyType))
		return undefined

	const result = undefined
		?? await macroImport.consumeOptional(reader, bodyType)
		?? await macroDebug.consumeOptional(reader, bodyType)
		?? await macroFunctionDeclaration.consumeOptional(reader, bodyType)
		?? await macroShorthand.consumeOptional(reader, bodyType)
		?? await macroEach.consumeOptional(reader, bodyType)
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
