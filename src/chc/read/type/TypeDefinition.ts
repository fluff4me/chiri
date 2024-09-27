import type ChiriReader from "../ChiriReader"
import type { ChiriType } from "../ChiriType"

interface TypeDefinition<TYPE extends string = string> {
	type: ChiriType<TYPE>
	consumeOptionalConstructor?(reader: ChiriReader): object | undefined
	consumeType?(reader: ChiriReader): string | undefined
	generics?: number | true | string[][]
	stringable?: true
}

function TypeDefinition<TYPE extends string = string> (definition: TypeDefinition<TYPE>) {
	return definition
}

export default TypeDefinition
