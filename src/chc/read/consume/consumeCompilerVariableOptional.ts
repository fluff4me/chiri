

import type { ChiriCompilerVariable, ChiriExpressionOperand } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import type { ChiriType } from "../ChiriType"
import consumeExpression from "./consumeExpression"
import { consumeTypeOptional } from "./consumeType"
import consumeWhiteSpace from "./consumeWhiteSpace"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"
import consumeWord from "./consumeWord"
import consumeWordOptional from "./consumeWordOptional"

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

	consumeWhiteSpace(reader)

	const name = consumeWord(reader)

	const postType = reader.i

	if (valueType)
		consumeWhiteSpaceOptional(reader)

	const assignment = reader.consumeOptional("??=", "=") as "??=" | "=" | undefined

	let expression: ChiriExpressionOperand | undefined
	if (assignment) {
		consumeWhiteSpaceOptional(reader)
		expression = consumeExpression(reader, valueType)
		if (valueType.name.value === "*")
			valueType = expression.valueType

	} else {
		reader.i = postType
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
