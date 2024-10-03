import type { ChiriPosition } from "../read/ChiriReader"
import consumeBlockEnd from "../read/consume/consumeBlockEnd"
import consumeBlockStartOptional from "../read/consume/consumeBlockStartOptional"
import consumeNewBlockLineOptional from "../read/consume/consumeNewBlockLineOptional"
import consumeWhiteSpaceOptional from "../read/consume/consumeWhiteSpaceOptional"
import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression"
import consumeExpression from "../read/consume/expression/consumeExpression"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export interface ChiriLiteralList {
	type: "literal"
	subType: "list"
	valueType: ChiriType
	value: ChiriExpressionOperand[]
	position: ChiriPosition
}

export default TypeDefinition({
	type: ChiriType.of("list"),
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
	coerce: value => Array.isArray(value) ? value : [value],
	is: value => Array.isArray(value),
})
