import type { ChiriPosition } from "../ChiriReader"
import { ChiriType } from "../ChiriType"
import type { ChiriTypeDefinition } from "../ChiriTypeManager"
import consumeBlockEnd from "../consume/consumeBlockEnd"
import consumeBlockStartOptional from "../consume/consumeBlockStartOptional"
import consumeNewBlockLineOptional from "../consume/consumeNewBlockLineOptional"
import consumeWhiteSpaceOptional from "../consume/consumeWhiteSpaceOptional"
import type { ChiriExpressionOperand } from "../consume/expression/consumeExpression"
import consumeExpression from "../consume/expression/consumeExpression"

export interface ChiriLiteralList {
	type: "literal"
	subType: "list"
	valueType: ChiriType
	value: ChiriExpressionOperand[]
	position: ChiriPosition
}

export default {
	stringable: true,
	generics: 1,
	consumeOptionalConstructor: (reader): ChiriLiteralList | undefined => {
		const position = reader.getPosition()
		if (!reader.consumeOptional("["))
			return undefined

		const expressions: ChiriExpressionOperand[] = []
		const multiline = consumeBlockStartOptional(reader)
		if (!multiline) {
			consumeWhiteSpaceOptional(reader)
			do expressions.push(consumeExpression.inline(reader))
			while (reader.consumeOptional(", "))

		} else {
			do expressions.push(consumeExpression.inline(reader))
			while (consumeNewBlockLineOptional(reader))

			consumeBlockEnd(reader)
		}

		const stringifiedTypes = expressions.map(expr => ChiriType.stringify(expr.valueType))
		if (new Set(stringifiedTypes).size > 1)
			throw reader.error(`Lists can only contain a single type. This list contains: ${stringifiedTypes.join(", ")}`)

		if (!multiline) {
			consumeWhiteSpaceOptional(reader)
			reader.consume("]")
		}

		return {
			type: "literal",
			subType: "list",
			valueType: ChiriType.of("list", expressions[0]?.valueType ?? "*"),
			value: expressions,
			position,
		}
	},
} as ChiriTypeDefinition
