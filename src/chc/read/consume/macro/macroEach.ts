import type { ChiriStatement } from "../../ChiriReader"
import { ChiriType } from "../../ChiriType"
import consumeBody from "../consumeBody"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
import consumeCompilerVariableOptional from "../consumeCompilerVariableOptional"
import consumeWhiteSpace from "../consumeWhiteSpace"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import MacroFunction from "./MacroFunction"

export interface ChiriEach {
	type: "each"
	iterable: ChiriWord
	variable: ChiriCompilerVariable
	content: ChiriStatement[]
}

export default MacroFunction("each")
	.consumeParameters(reader => {
		consumeWhiteSpace(reader)

		let e = reader.i
		const iterable = consumeWord(reader)
		const iterableVariable = reader.getVariable(iterable.value)
		if (!iterableVariable)
			throw reader.error(e, `No variable "${iterable.value}" exists`)

		if (!reader.types.isAssignable(iterableVariable.valueType, ChiriType.of("list", "*")))
			throw reader.error(e, `Expected list or record, was ${ChiriType.stringify(iterableVariable?.valueType)}`)

		consumeWhiteSpace(reader)
		reader.consume("as")
		consumeWhiteSpace(reader)

		e = reader.i
		const variable = consumeCompilerVariableOptional(reader, false)
		if (!variable)
			throw reader.error("Expected variable declaration")

		if (!reader.types.isAssignable(iterableVariable.valueType, variable.valueType))
			throw reader.error(e, `Iterable type "${ChiriType.stringify(iterableVariable.valueType)}" is not assignable to "${ChiriType.stringify(variable.valueType)}"`)

		return {
			iterable,
			variable,
		}
	})
	.consume(async ({ reader, extra: { iterable, variable } }): Promise<ChiriEach> => {
		reader.consume(":")
		const body = await consumeBody(reader, "inherit", sub => sub.addOuterStatement(variable))
		return {
			type: "each",
			iterable,
			variable,
			...body,
		}
	})
