
import { INTERNAL_POSITION } from "../../../../constants"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
import { ChiriType } from "../../ChiriType"
import consumeWhiteSpace from "../consumeWhiteSpace"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import type { ChiriExpressionOperand } from "../expression/consumeExpression"
import consumeExpression, { consumeOperatorOptional } from "../expression/consumeExpression"
import MacroConstruct from "./MacroConstruct"

export interface ChiriAssignment {
	type: "assignment"
	name: ChiriWord
	expression?: ChiriExpressionOperand
	position: ChiriPosition
	assignment?: "=" | "??="
}

const empy = {} as never

interface SetData {
	name: ChiriWord
	expression: ChiriExpressionOperand
	assignment: "=" | "??="
}

const consumeAssignmentData = (reader: ChiriReader, skipInitialWhitespace = false): SetData => {
	if (!skipInitialWhitespace)
		consumeWhiteSpace(reader)

	const varName = consumeWord(reader)

	const variable = reader.getVariable(varName.value)

	consumeWhiteSpaceOptional(reader)

	const binaryOperators = reader.getBinaryOperators()
	const type = variable.valueType
	const operatorsForType = binaryOperators[type.name.value] ?? empy
	let operator = undefined
		?? reader.consumeOptional("??")
		?? reader.consumeOptional("++")
		?? reader.consumeOptional("--")
		?? consumeOperatorOptional(reader, operatorsForType)

	if (operator !== "++" && operator !== "--")
		reader.consume("=")

	consumeWhiteSpaceOptional(reader)

	const expr = operator === "++" || operator === "--" ? undefined : consumeExpression(reader, type)

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
				operandA: { type: "get", name: varName, valueType: variable.valueType },
				operandB: expr ? expr : { type: "literal", subType: "int", valueType: ChiriType.of("int"), value: "1", position: INTERNAL_POSITION },
				valueType: variable.valueType,
			},
	}
}

export const consumeAssignmentOptional = (reader: ChiriReader): ChiriAssignment | undefined => {
	const position = reader.getPosition()
	if (!reader.consumeOptional("set"))
		return undefined

	if (!consumeWhiteSpaceOptional(reader))
		return undefined

	const data = consumeAssignmentData(reader, true)
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
