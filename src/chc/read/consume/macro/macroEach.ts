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
import type { ChiriMacroBlock } from "./MacroConstruct"
import MacroConstruct from "./MacroConstruct"

export interface ChiriEach extends ChiriMacroBlock {
	type: "each"
	iterable: ChiriExpressionOperand
	keyVariable?: ChiriCompilerVariable
	variable?: ChiriCompilerVariable
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("each")
	.consumeParameters(async reader => {
		consumeWhiteSpace(reader)

		reader.consumeOptional("in ")

		const e = reader.i
		const iterable = consumeRangeOptional(reader) ?? consumeExpression.inline(reader, typeList.type, typeRecord.type, typeString.type)
		const isRecord = reader.types.isAssignable(iterable.valueType, typeRecord.type)
		const isString = reader.types.isAssignable(iterable.valueType, typeString.type)

		let variable1: ChiriCompilerVariable | undefined
		let variable2: ChiriCompilerVariable | undefined
		if (consumeWhiteSpaceOptional(reader) && reader.consumeOptional("as") && consumeWhiteSpaceOptional(reader)) {
			variable1 = await consumeCompilerVariableOptional(reader, false, true)
			if (!variable1)
				throw reader.error("Expected variable declaration")

			if (reader.consumeOptional(",")) {
				consumeWhiteSpaceOptional(reader)

				variable2 = await consumeCompilerVariableOptional(reader, false, true)
				if (!variable2)
					throw reader.error("Expected variable declaration")
			}
		}

		if (variable1 && !variable2 && isRecord)
			throw reader.error("Expected variable declarations for both a key and its associated value")

		if (variable1 && isRecord && !reader.types.isAssignable(typeString.type, variable1.valueType))
			throw reader.error(e, `Iterable value of type "${ChiriType.stringify(typeString.type)}" is not assignable to "${ChiriType.stringify(variable1.valueType)}"`)

		const valueType = isString ? typeString.type : iterable.valueType.generics[0]
		if (variable1 && !reader.types.isAssignable(valueType, (variable2 ?? variable1).valueType))
			throw reader.error(e, `Iterable value of type "${ChiriType.stringify(valueType)}" is not assignable to "${ChiriType.stringify((variable2 ?? variable1).valueType)}"`)

		const keyVariable = variable2 ? variable1 : undefined
		if (keyVariable)
			keyVariable.valueType = isRecord ? typeString.type : typeUint.type

		const variable = variable2 ?? variable1
		if (variable)
			variable.valueType = valueType

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
			if (variable)
				sub.addOuterStatement(variable)
		})
		return {
			type: "each",
			isBlock: true,
			iterable,
			keyVariable,
			variable,
			...body,
			position,
		}
	})
