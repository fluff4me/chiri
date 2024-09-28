

import type { ChiriType } from "../../type/ChiriType"
import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import { consumeTypeOptional } from "./consumeType"
import consumeWhiteSpace from "./consumeWhiteSpace"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"
import consumeWord, { type ChiriWord } from "./consumeWord"
import consumeWordOptional from "./consumeWordOptional"
import type { ChiriExpressionResult } from "./expression/consumeExpression"
import consumeExpression from "./expression/consumeExpression"

export interface ChiriCompilerVariable {
	type: "variable"
	valueType: ChiriType
	name: ChiriWord
	expression?: ChiriExpressionResult
	position: ChiriPosition
	assignment?: "=" | "??="
}

export default async (reader: ChiriReader, prefix = true): Promise<ChiriCompilerVariable | undefined> => {
	const save = reader.savePosition()
	const position = reader.getPosition()
	if (prefix)
		reader.consume("#")

	const varWord = consumeWordOptional(reader, "var")
	let valueType: ChiriType | undefined = !varWord ? consumeTypeOptional(reader)
		: {
			type: "type",
			name: { ...varWord, value: "*" },
			generics: [],
		}

	if (!valueType) {
		reader.restorePosition(save)
		return undefined
	}

	if (valueType.name.value === "body" && reader.getVariables(true).find(variable => variable.valueType.name.value === "body"))
		throw reader.error(save.i, "A macro cannot accept multiple body parameters")

	if (valueType.name.value === "body" && reader.context.type === "function")
		throw reader.error(save.i, "A function cannot accept a body parameter")

	consumeWhiteSpace(reader)

	const name = consumeWord(reader)

	const postType = reader.i

	if (valueType)
		consumeWhiteSpaceOptional(reader)

	let assignment = reader.consumeOptional("??=", "=") as "??=" | "=" | undefined
	if (assignment === "??=" && reader.context.type === "mixin")
		throw reader.error(save.i, "Mixins cannot accept parameters")

	let expression: ChiriExpressionResult | undefined
	if (assignment) {
		consumeWhiteSpaceOptional(reader)
		expression = await consumeExpression(reader, valueType)
		if (valueType.name.value === "*")
			valueType = expression.valueType

	} else {
		reader.i = postType

		if (!assignment && reader.consumeOptional("?"))
			assignment = "??="

		else if (reader.context.type === "mixin")
			throw reader.error(save.i, "Mixins cannot accept parameters")
	}

	if (!assignment && reader.getVariables(true).findLast(variable => variable.assignment === "??="))
		throw reader.error(save.i, "Required parameters cannot be declared after optional parameters")

	return {
		type: "variable",
		valueType,
		name,
		expression,
		position,
		assignment,
	}
}
