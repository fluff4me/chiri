import type { ChiriTypeDefinition } from "../ChiriTypeManager"
import BodyTypes from "../consume/body/BodyTypes"
import consumeFunctionBodyOptional from "../consume/consumeFunctionBodyOptional"

export default {
	consumeOptionalConstructor: consumeFunctionBodyOptional,
	generics: [BodyTypes],
} as ChiriTypeDefinition
