

import { ChiriType } from "../ChiriType"
import consumeOptionalString from "../consume/consumeStringOptional"
import TypeDefinition from "./TypeDefinition"

export default TypeDefinition({
	type: ChiriType.of("string"),
	stringable: true,
	consumeOptionalConstructor: consumeOptionalString,
})
