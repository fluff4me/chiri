import { ChiriType } from "../../../type/ChiriType"
import typeList from "../../../type/typeList"
import typeRecord from "../../../type/typeRecord"
import typeString from "../../../type/typeString"
import typeUint from "../../../type/typeUint"
import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import consumeBody from "../consumeBody"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
import consumeCompilerVariableOptional from "../consumeCompilerVariableOptional"
import consumeWhiteSpace from "../consumeWhiteSpace"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriExpressionOperand } from "../expression/consumeExpression"
import consumeExpression from "../expression/consumeExpression"
import consumeRangeOptional from "../expression/consumeRangeOptional"
import MacroConstruct from "./MacroConstruct"

export interface ChiriEach {
	type: "each"
	iterable: ChiriExpressionOperand
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
		const iterable = consumeRangeOptional(reader) ?? consumeExpression.inline(reader, typeList.type, typeRecord.type)
		const isList = reader.types.isAssignable(iterable.valueType, typeList.type)

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

		if (!variable2 && !isList)
			throw reader.error("Expected variable declarations for both a key and its associated value")

		if (!isList && !reader.types.isAssignable(variable1.valueType, typeString.type))
			throw reader.error(e, `Iterable value of type "${ChiriType.stringify(variable1.valueType)}" is not assignable to "${ChiriType.stringify(typeString.type)}"`)

		if (!reader.types.isAssignable(iterable.valueType.generics[0], (variable2 ?? variable1).valueType))
			throw reader.error(e, `Iterable value of type "${ChiriType.stringify(iterable.valueType.generics[0])}" is not assignable to "${ChiriType.stringify((variable2 ?? variable1).valueType)}"`)

		const keyVariable = variable2 ? variable1 : undefined
		if (keyVariable)
			keyVariable.valueType = isList ? typeUint.type : typeString.type

		const variable = variable2 ?? variable1
		variable.valueType = iterable.valueType.generics[0]

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
