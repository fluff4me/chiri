
import { INTERNAL_POSITION } from "../../../../constants"
import { ChiriType } from "../../../type/ChiriType"
import type { Operator } from "../../../type/ChiriTypeManager"
import _ from "../../../util/_"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
import consumeWhiteSpace from "../consumeWhiteSpace"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import type { ChiriExpressionResult } from "../expression/consumeExpression"
import consumeExpression, { consumeOperatorOptional } from "../expression/consumeExpression"
import MacroConstruct from "./MacroConstruct"

export interface ChiriAssignment {
	type: "assignment"
	name: ChiriWord
	expression?: ChiriExpressionResult
	position: ChiriPosition
	assignment: "=" | "??="
}

const empy = {} as never

interface SetData {
	name: ChiriWord
	expression: ChiriExpressionResult
	assignment: "=" | "??="
}

const consumeAssignmentData = async (reader: ChiriReader, skipInitialWhitespace = false, inline = false): Promise<SetData> => {
	if (!skipInitialWhitespace)
		consumeWhiteSpace(reader)

	let e = reader.i
	const varName = consumeWord(reader)

	const variable = reader.getVariable(varName.value)
	if (variable.valueType.name.value === "body")
		throw reader.error(e, "Cannot reassign a variable of type \"body\"")

	consumeWhiteSpaceOptional(reader)

	const binaryOperators = reader.types.binaryOperators
	const type = variable.valueType
	const operatorsForType = binaryOperators[type.name.value] ?? empy
	let operator = _
		?? reader.consumeOptional("??")
		?? reader.consumeOptional("++")
		?? reader.consumeOptional("--")
		?? consumeOperatorOptional(reader, operatorsForType)

	if (operator !== "++" && operator !== "--")
		reader.consume("=")

	consumeWhiteSpaceOptional(reader)

	e = reader.i
	const expr = operator === "++" || operator === "--" ? undefined
		: inline ? consumeExpression.inline(reader) : await consumeExpression(reader)

	const coercible = expr && operator && reader.types.canCoerceOperandB(type.name.value, operator, expr.valueType.name.value)
	if (expr && !coercible && !reader.types.isAssignable(expr.valueType, type))
		throw reader.error(e, `Expression of type "${ChiriType.stringify(expr.valueType)}" is not assignable to "${ChiriType.stringify(variable.valueType)}"`)

	if (operator === "++")
		operator = "+"
	if (operator === "--")
		operator = "-"

	return {
		name: varName,
		assignment: operator === "??" ? "??=" : "=",
		expression: !operator ? expr!
			: {
				type: "expression",
				subType: "binary",
				operator,
				operandA: { type: "get", name: varName, valueType: variable.valueType, position: varName.position },
				operandB: expr ? expr : { type: "literal", subType: "int", valueType: ChiriType.of("int"), value: "1", position: INTERNAL_POSITION },
				valueType: ChiriType.of(reader.types.binaryOperators[variable.valueType.name.value]?.[operator as Operator]?.[expr?.valueType.name.value ?? "int"] ?? "*"),
				position: varName.position,
			},
	}
}

export const consumeAssignmentOptional = async (reader: ChiriReader, inline = false): Promise<ChiriAssignment | undefined> => {
	const position = reader.getPosition()
	if (!reader.consumeOptional("set"))
		return undefined

	if (!consumeWhiteSpaceOptional(reader))
		return undefined

	const data = await consumeAssignmentData(reader, true, inline)
	return {
		type: "assignment",
		...data,
		position,
	}
}

export default MacroConstruct("set")
	.consumeParameters(consumeAssignmentData)
	.consume(({ extra, position }): ChiriAssignment => {
		return {
			type: "assignment",
			...extra,
			position,
		}
	})
