import consumeOptionalString from "../read/consume/consumeStringOptional"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export default TypeDefinition({
	type: ChiriType.of("string"),
	stringable: true,
	consumeOptionalConstructor: consumeOptionalString,
	is: value => typeof value === "string",
})

