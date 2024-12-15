import _ from "../../util/_"
import getFunctionParameters from "../../util/getFunctionParameters"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition, ChiriStatement } from "../ChiriReader"
import type { ChiriContextSpreadable, ChiriContextType, ResolveContextDataTuple } from "./body/Contexts"
import Contexts from "./body/Contexts"
import consumeBodyOptional from "./consumeBodyOptional"
import type { ChiriCompilerVariable } from "./consumeCompilerVariableOptional"
import consumeCompilerVariable from "./consumeCompilerVariableOptional"
import consumeMacroBlockUseOptional from "./consumeMacroBlockUseOptional"
import consumeMacroParameters from "./consumeMacroParameters"
import type { ChiriWord } from "./consumeWord"
import consumeWordOptional from "./consumeWordOptional"
import type { ChiriExpressionOperand } from "./expression/consumeExpression"
import type { ChiriAfter } from "./macro/macroAfter"
import macroAfter from "./macro/macroAfter"
import type { ChiriAlias } from "./macro/macroAlias"
import macroAlias from "./macro/macroAlias"
import type { ChiriAnimate } from "./macro/macroAnimate"
import macroAnimate from "./macro/macroAnimate"
import type { ChiriAnimation } from "./macro/macroAnimation"
import macroAnimation from "./macro/macroAnimation"
import type { ChiriBreak } from "./macro/macroBreak"
import macroBreak from "./macro/macroBreak"
import type { ChiriContinue } from "./macro/macroContinue"
import macroContinue from "./macro/macroContinue"
import macroDebug from "./macro/macroDebug"
import type { ChiriDo } from "./macro/macroDo"
import type { ChiriEach } from "./macro/macroEach"
import macroError from "./macro/macroError"
import macroExport from "./macro/macroExport"
import type { ChiriFontFace } from "./macro/macroFontFace"
import macroFontFace from "./macro/macroFontFace"
import type { ChiriFor } from "./macro/macroFor"
import type { ChiriFunction } from "./macro/macroFunctionDeclaration"
import macroFunctionDeclaration from "./macro/macroFunctionDeclaration"
import type { ChiriElse, ChiriIf } from "./macro/macroIf"
import type { ChiriCSSImport, ChiriImport } from "./macro/macroImport"
import macroImport, { macroImportCSS } from "./macro/macroImport"
import type { ChiriInclude } from "./macro/macroInclude"
import macroInclude from "./macro/macroInclude"
import type { ChiriMacro } from "./macro/macroMacroDeclaration"
import macroMacroDeclaration from "./macro/macroMacroDeclaration"
import type { ChiriSelect } from "./macro/macroSelect"
import macroSelect from "./macro/macroSelect"
import type { ChiriAssignment } from "./macro/macroSet"
import macroSet from "./macro/macroSet"
import type { ChiriShorthand } from "./macro/macroShorthand"
import macroShorthand from "./macro/macroShorthand"
import type { ChiriWhile } from "./macro/macroWhile"

export type MacroResult =
	| ChiriCompilerVariable
	| ChiriMacro
	| ChiriMacroUse
	| ChiriShorthand
	| ChiriImport
	| ChiriEach
	| ChiriAlias
	| ChiriDo
	| ChiriAssignment
	| ChiriFor
	| ChiriFunction
	| ChiriWhile
	| ChiriIf
	| ChiriElse
	| ChiriInclude
	| ChiriCSSImport
	| ChiriAnimation
	| ChiriAnimate
	| ChiriAfter
	| ChiriFontFace
	| ChiriSelect
	| ChiriBreak
	| ChiriContinue

export type ChiriMacroUseContext = [context: ChiriContextType, ...data: ResolveContextDataTuple<ChiriContextType>]

export default async function (reader: ChiriReader): Promise<MacroResult | undefined>
export default async function <CONTEXT extends ChiriContextType> (reader: ChiriReader, context: CONTEXT, ...data: ResolveContextDataTuple<CONTEXT>): Promise<MacroResult | undefined>
export default async function (reader: ChiriReader, ...context: ChiriContextSpreadable): Promise<MacroResult | undefined>
export default async function (reader: ChiriReader, ...args: any[]): Promise<MacroResult | undefined> {
	if (reader.input[reader.i] !== "#" || reader.input[reader.i + 1] === "{")
		return undefined

	if (reader.peek("#return "))
		return undefined

	const context = args as ChiriMacroUseContext
	if (await macroExport.consumeOptional(reader, ...context))
		return undefined

	const result = _
		?? await macroImportCSS.consumeOptional(reader, ...context)
		?? await macroImport.consumeOptional(reader, ...context)
		?? await macroDebug.consumeOptional(reader, ...context)
		?? await macroError.consumeOptional(reader, ...context)
		?? await macroMacroDeclaration.consumeOptional(reader, ...context)
		?? await macroFunctionDeclaration.consumeOptional(reader, ...context)
		?? await macroShorthand.consumeOptional(reader, ...context)
		?? await macroAlias.consumeOptional(reader, ...context)
		?? await macroSet.consumeOptional(reader, ...context)
		?? await macroBreak.consumeOptional(reader, ...context)
		?? await macroContinue.consumeOptional(reader, ...context)
		?? await consumeMacroBlockUseOptional(reader, context)
		?? await macroAnimation.consumeOptional(reader, ...context)
		?? await macroAnimate.consumeOptional(reader, ...context)
		?? await macroAfter.consumeOptional(reader, ...context)
		?? await macroFontFace.consumeOptional(reader, ...context)
		?? await macroInclude.consumeOptional(reader, ...context)
		?? await macroSelect.consumeOptional(reader, ...context)
		?? await consumeDeclaredUse(reader)
		?? await consumeCompilerVariable(reader)

	if (!result) {
		if (reader.context?.type === "text")
			return undefined

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


export interface ChiriMacroUse {
	type: "macro-use"
	name: ChiriWord
	assignments: Record<string, ChiriExpressionOperand>
	content: ChiriStatement[]
	position: ChiriPosition
}

async function consumeDeclaredUse (reader: ChiriReader): Promise<ChiriMacroUse | undefined> {
	const position = reader.getPosition()
	const restore = reader.savePosition()
	if (!reader.consumeOptional("#"))
		return undefined

	const word = consumeWordOptional(reader)
	const fn = word?.value && reader.getMacroOptional(word.value)
	if (!fn) {
		reader.restorePosition(restore)
		return undefined
	}

	const assignments = consumeMacroParameters(reader, restore.i, fn)

	const bodyParameter = getFunctionParameters(fn)
		.sort((a, b) => +!!a.expression - +!!b.expression)
		.find(parameter => parameter.valueType.name.value === "body")

	const context = bodyParameter?.valueType.generics[0].name.value as ChiriContextType | undefined
	if (context === "function" || (context && !Contexts.includes(context)))
		throw reader.error(`Invalid body context "${context}"`)

	const body = context && await consumeBodyOptional(reader, context)

	return {
		type: "macro-use",
		name: word,
		assignments,
		content: body ?? [],
		position,
	}
}
