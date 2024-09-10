

import type { ChiriTypeDefinition } from "../ChiriTypeManager"
import consumeIntegerOptional from "../consume/consumeIntegerOptional"

export default {
	stringable: true,
	consumeOptionalConstructor: reader => consumeIntegerOptional(reader),
} as ChiriTypeDefinition
