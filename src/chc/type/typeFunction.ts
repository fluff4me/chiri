import type { ChiriPosition } from "../read/ChiriReader"
import type { ChiriLiteralString } from "../read/consume/consumeStringOptional"
import type { ChiriWord } from "../read/consume/consumeWord"
import type { ChiriWordInterpolated } from "../read/consume/consumeWordInterpolatedOptional"
import consumeWordOptional from "../read/consume/consumeWordOptional"
import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression"
import getFunctionParameters from "../util/getFunctionParameters"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export type ChiriLiteralRecordKeyValueTuple = [key: ChiriLiteralString | ChiriWordInterpolated, value: ChiriExpressionOperand]

export interface ChiriFunctionReference {
	type: "literal"
	subType: "function"
	valueType: ChiriType
	name: ChiriWord
	position: ChiriPosition
}

const TYPE_FUNCTION = ChiriType.of("function", "*")
export default TypeDefinition({
	type: TYPE_FUNCTION,
	stringable: true,
	generics: true,
	isAssignable (types, type, toType) {
		if (type.name.value !== toType.name.value)
			return false

		if (type.generics.length > toType.generics.length)
			return false

		const parametersEnd = type.generics.length - 1
		for (let i = 0; i < parametersEnd; i++)
			if (!types.isAssignable(type.generics[i], toType.generics[i]))
				return false

		return true
	},
	consumeOptionalConstructor: (reader): ChiriFunctionReference | undefined => {
		const i = reader.i
		const name = consumeWordOptional(reader)
		if (!name)
			return undefined

		const fn = reader.getFunctionOptional(name.value)
		if (!fn || reader.getVariableOptional(name.value)) {
			reader.i = i
			return undefined
		}

		const parameterTypes = getFunctionParameters(fn).map(param => param.valueType)

		return {
			type: "literal",
			subType: "function",
			valueType: ChiriType.of("function", ...parameterTypes, fn.returnType),
			name: name,
			position: name.position,
		}
	},
})
