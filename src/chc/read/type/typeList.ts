import type { ChiriExpressionOperand } from "../../ChiriAST"
import { ChiriType } from "../ChiriType"
import type { ChiriTypeDefinition } from "../ChiriTypeManager"
import consumeBlockStartOptional from "../consume/consumeBlockStartOptional"
import consumeExpression from "../consume/consumeExpression"
import consumeNewBlockLineOptional from "../consume/consumeNewBlockLineOptional"
import consumeWhiteSpaceOptional from "../consume/consumeWhiteSpaceOptional"

export interface ChiriLiteralList {
	type: "literal"
	subType: "list"
	valueType: ChiriType
	value: ChiriExpressionOperand[]
}

export default {
	stringable: true,
	generics: 1,
	consumeOptionalConstructor: (reader): ChiriLiteralList | undefined => {
		if (!reader.consumeOptional("["))
			return undefined

		const expressions: ChiriExpressionOperand[] = []
		const multiline = consumeBlockStartOptional(reader)
		if (!multiline) {
			consumeWhiteSpaceOptional(reader)
			do expressions.push(consumeExpression(reader))
			while (reader.consumeOptional(", "))

		} else
			do expressions.push(consumeExpression(reader))
			while (consumeNewBlockLineOptional(reader))

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
		}
	},
} as ChiriTypeDefinition
