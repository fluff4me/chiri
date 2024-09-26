

import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import type { ChiriType } from "../ChiriType"
import type { ChiriExpressionOperand } from "./consumeExpression"
import consumeExpression from "./consumeExpression"
import { consumeTypeOptional } from "./consumeType"
import consumeWhiteSpace from "./consumeWhiteSpace"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"
import consumeWord, { type ChiriWord } from "./consumeWord"
import consumeWordOptional from "./consumeWordOptional"

export interface ChiriCompilerVariable {
	type: "variable"
	valueType: ChiriType
	name: ChiriWord
	expression?: ChiriExpressionOperand
	position: ChiriPosition
	assignment?: "=" | "??="
}

export default (reader: ChiriReader, prefix = true): ChiriCompilerVariable | undefined => {
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

	if (valueType.name.value === "body" && reader.getVariables().find(variable => variable.valueType.name.value === "body"))
		throw reader.error(save.i, "A function cannot declare multiple body parameters")

	consumeWhiteSpace(reader)

	const name = consumeWord(reader)

	const postType = reader.i

	if (valueType)
		consumeWhiteSpaceOptional(reader)

	let assignment = reader.consumeOptional("??=", "=") as "??=" | "=" | undefined

	if (assignment === "??=" && reader.context.type === "mixin")
		throw reader.error(save.i, "Mixins cannot accept parameters")

	let expression: ChiriExpressionOperand | undefined
	if (assignment) {
		consumeWhiteSpaceOptional(reader)
		expression = consumeExpression(reader, valueType)
		if (valueType.name.value === "*")
			valueType = expression.valueType

	} else {
		reader.i = postType

		if (!assignment && reader.consumeOptional("?"))
			assignment = "??="

		else if (reader.context.type === "mixin")
			throw reader.error(save.i, "Mixins cannot accept parameters")
	}

	return {
		type: "variable",
		valueType,
		name,
		expression,
		position,
		assignment,
	}
}
