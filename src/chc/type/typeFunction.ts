import type { ChiriPosition } from "../read/ChiriReader"
import type { ChiriLiteralString } from "../read/consume/consumeStringOptional"
import type { ChiriWord } from "../read/consume/consumeWord"
import type { ChiriWordInterpolated } from "../read/consume/consumeWordInterpolatedOptional"
import consumeWordOptional from "../read/consume/consumeWordOptional"
import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export type ChiriLiteralRecordKeyValueTuple = [key: ChiriLiteralString | ChiriWordInterpolated, value: ChiriExpressionOperand]

export interface ChiriFunctionReference {
	type: "function"
	valueType: ChiriType
	name: ChiriWord
	position: ChiriPosition
}

const TYPE_FUNCTION = ChiriType.of("function", "*")
export default TypeDefinition({
	type: TYPE_FUNCTION,
	stringable: true,
	generics: true,
	consumeOptionalConstructor: (reader): ChiriFunctionReference | undefined => {
		const i = reader.i
		const name = consumeWordOptional(reader)
		if (!name || !reader.getFunctionOptional(name.value) || reader.getVariableOptional(name.value)) {
			reader.i = i
			return undefined
		}

		return {
			type: "function",
			valueType: TYPE_FUNCTION,
			name: name,
			position: name.position,
		}
	},
})
