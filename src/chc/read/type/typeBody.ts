import type { ChiriTypeDefinition } from "../ChiriTypeManager"
import Contexts from "../consume/body/Contexts"
import consumeFunctionBodyOptional from "../consume/consumeBodyOptional"

export default {
	consumeOptionalConstructor: consumeFunctionBodyOptional,
	generics: [Contexts],
} as ChiriTypeDefinition
