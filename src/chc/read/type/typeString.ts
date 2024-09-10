

import type { ChiriTypeDefinition } from "../ChiriTypeManager"
import consumeOptionalString from "../consume/consumeStringOptional"

export default {
	stringable: true,
	consumeOptionalConstructor: consumeOptionalString,
} as ChiriTypeDefinition
