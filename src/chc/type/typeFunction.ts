import type { ChiriPosition } from "../read/ChiriReader"
import type { ChiriLiteralString } from "../read/consume/consumeStringOptional"
import type { ChiriWord } from "../read/consume/consumeWord"
import type { ChiriWordInterpolated } from "../read/consume/consumeWordInterpolatedOptional"
import consumeWordOptional from "../read/consume/consumeWordOptional"
import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export type ChiriLiteralRecordKeyValueTuple = [key: ChiriLiteralString | ChiriWordInterpolated, value: ChiriExpressionOperand]

export interface ChiriLiteralFunctionReference {
	type: "literal"
	subType: "function"
	valueType: ChiriType
	value: ChiriWord
	position: ChiriPosition
}

const TYPE_FUNCTION = ChiriType.of("function", "*")
export default TypeDefinition({
	type: TYPE_FUNCTION,
	stringable: true,
	generics: true,
	consumeOptionalConstructor: (reader): ChiriLiteralFunctionReference | undefined => {
		const i = reader.i
		const name = consumeWordOptional(reader)
		if (!name || !reader.getFunctionOptional(name.value) || reader.getVariableOptional(name.value)) {
			reader.i = i
			return undefined
		}

		return {
			type: "literal",
			subType: "function",
			valueType: TYPE_FUNCTION,
			value: name,
			position: name.position,
		}
	},
})
