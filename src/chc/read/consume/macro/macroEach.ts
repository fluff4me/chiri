import { ChiriType } from "../../../type/ChiriType"
import typeString from "../../../type/typeString"
import typeUint from "../../../type/typeUint"
import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import consumeBody from "../consumeBody"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
import consumeCompilerVariableOptional from "../consumeCompilerVariableOptional"
import consumeWhiteSpace from "../consumeWhiteSpace"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import MacroConstruct from "./MacroConstruct"

export interface ChiriEach {
	type: "each"
	iterable: ChiriWord
	keyVariable?: ChiriCompilerVariable
	variable: ChiriCompilerVariable
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("each")
	.consumeParameters(async reader => {
		consumeWhiteSpace(reader)

		reader.consumeOptional("in ")

		const e = reader.i
		const iterable = consumeWord(reader)
		const iterableVariable = reader.getVariable(iterable.value)
		if (!reader.types.isAssignable(iterableVariable.valueType, ChiriType.of("list", "*"), ChiriType.of("record", "*")))
			throw reader.error(e, `Expected list or record, was ${ChiriType.stringify(iterableVariable?.valueType)}`)

		consumeWhiteSpace(reader)
		reader.consume("as")
		consumeWhiteSpace(reader)

		const variable1 = await consumeCompilerVariableOptional(reader, false)
		if (!variable1)
			throw reader.error("Expected variable declaration")

		let variable2: ChiriCompilerVariable | undefined
		if (reader.consumeOptional(",")) {
			consumeWhiteSpaceOptional(reader)

			variable2 = await consumeCompilerVariableOptional(reader, false)
			if (!variable2)
				throw reader.error("Expected variable declaration")
		}

		if (!variable2 && iterableVariable.valueType.name.value === "record")
			throw reader.error("Expected variable declarations for both a key and its associated value")

		if (iterableVariable.valueType.name.value === "record" && !reader.types.isAssignable(variable1.valueType, typeString.type))
			throw reader.error(e, `Iterable value of type "${ChiriType.stringify(variable1.valueType)}" is not assignable to "${ChiriType.stringify(typeString.type)}"`)

		if (!reader.types.isAssignable(iterableVariable.valueType.generics[0], (variable2 ?? variable1).valueType))
			throw reader.error(e, `Iterable value of type "${ChiriType.stringify(iterableVariable.valueType.generics[0])}" is not assignable to "${ChiriType.stringify((variable2 ?? variable1).valueType)}"`)

		const keyVariable = variable2 ? variable1 : undefined
		if (keyVariable)
			keyVariable.valueType = iterableVariable.valueType.name.value === "list" ? typeUint.type : typeString.type

		const variable = variable2 ?? variable1
		variable.valueType = iterableVariable.valueType.generics[0]

		return {
			iterable,
			keyVariable,
			variable,
		}
	})
	.consume(async ({ reader, extra: { iterable, variable, keyVariable }, position }): Promise<ChiriEach> => {
		reader.consume(":")
		const body = await consumeBody(reader, "inherit", sub => {
			if (keyVariable)
				sub.addOuterStatement(keyVariable)
			sub.addOuterStatement(variable)
		})
		return {
			type: "each",
			iterable,
			keyVariable,
			variable,
			...body,
			position,
		}
	})
