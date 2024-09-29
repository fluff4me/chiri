import { ChiriType } from "../../../type/ChiriType"
import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import consumeBody from "../consumeBody"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
import consumeCompilerVariableOptional from "../consumeCompilerVariableOptional"
import consumeWhiteSpace from "../consumeWhiteSpace"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import MacroConstruct from "./MacroConstruct"

export interface ChiriEach {
	type: "each"
	iterable: ChiriWord
	variable: ChiriCompilerVariable
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("each")
	.consumeParameters(async reader => {
		consumeWhiteSpace(reader)

		let e = reader.i
		const iterable = consumeWord(reader)
		const iterableVariable = reader.getVariable(iterable.value)
		if (!reader.types.isAssignable(iterableVariable.valueType, ChiriType.of("list", "*")))
			throw reader.error(e, `Expected list or record, was ${ChiriType.stringify(iterableVariable?.valueType)}`)

		consumeWhiteSpace(reader)
		reader.consume("as")
		consumeWhiteSpace(reader)

		e = reader.i
		const variable = await consumeCompilerVariableOptional(reader, false)
		if (!variable)
			throw reader.error("Expected variable declaration")

		if (!reader.types.isAssignable(iterableVariable.valueType.generics[0], variable.valueType))
			throw reader.error(e, `Iterable of type "${ChiriType.stringify(iterableVariable.valueType.generics[0])}" is not assignable to "${ChiriType.stringify(variable.valueType)}"`)

		return {
			iterable,
			variable,
		}
	})
	.consume(async ({ reader, extra: { iterable, variable }, position }): Promise<ChiriEach> => {
		reader.consume(":")
		const body = await consumeBody(reader, "inherit", sub => sub.addOuterStatement(variable))
		return {
			type: "each",
			iterable,
			variable,
			...body,
			position,
		}
	})
