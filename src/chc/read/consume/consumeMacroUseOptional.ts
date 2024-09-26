import type ChiriReader from "../ChiriReader"
import type { ChiriContext } from "./body/Contexts"
import type { ChiriCompilerVariable } from "./consumeCompilerVariableOptional"
import consumeCompilerVariable from "./consumeCompilerVariableOptional"
import type { ChiriFunctionUse } from "./consumeFunctionUseOptional"
import consumeFunctionUseOptional from "./consumeFunctionUseOptional"
import consumeWordOptional from "./consumeWordOptional"
import type { ChiriAlias } from "./macro/macroAlias"
import macroAlias from "./macro/macroAlias"
import macroDebug from "./macro/macroDebug"
import type { ChiriDo } from "./macro/macroDo"
import macroDo from "./macro/macroDo"
import type { ChiriEach } from "./macro/macroEach"
import macroEach from "./macro/macroEach"
import macroExport from "./macro/macroExport"
import type { ChiriFor } from "./macro/macroFor"
import macroFor from "./macro/macroFor"
import type { ChiriFunction } from "./macro/macroFunctionDeclaration"
import macroFunctionDeclaration from "./macro/macroFunctionDeclaration"
import type { ChiriImport } from "./macro/macroImport"
import macroImport from "./macro/macroImport"
import type { ChiriAssignment } from "./macro/macroSet"
import macroSet from "./macro/macroSet"
import type { ChiriShorthand } from "./macro/macroShorthand"
import macroShorthand from "./macro/macroShorthand"

export type MacroResult =
	| ChiriCompilerVariable
	| ChiriFunction
	| ChiriFunctionUse
	| ChiriShorthand
	| ChiriImport
	| ChiriEach
	| ChiriAlias
	| ChiriDo
	| ChiriAssignment
	| ChiriFor

export default async (reader: ChiriReader, context: ChiriContext): Promise<MacroResult | undefined> => {
	if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] === "{")
		return undefined

	if (await macroExport.consumeOptional(reader, context))
		return undefined

	const result = undefined
		?? await macroImport.consumeOptional(reader, context)
		?? await macroDebug.consumeOptional(reader, context)
		?? await macroFunctionDeclaration.consumeOptional(reader, context)
		?? await macroShorthand.consumeOptional(reader, context)
		?? await macroAlias.consumeOptional(reader, context)
		?? await macroEach.consumeOptional(reader, context)
		?? await macroDo.consumeOptional(reader, context)
		?? await macroSet.consumeOptional(reader, context)
		?? await macroFor.consumeOptional(reader, context)
		?? await consumeFunctionUseOptional(reader, context)
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
