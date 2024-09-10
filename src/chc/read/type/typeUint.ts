

import type { ChiriTypeDefinition } from "../ChiriTypeManager"
import consumeIntegerOptional from "../consume/consumeUnsignedIntegerOptional"

export default {
	stringable: true,
	consumeOptionalConstructor: reader => consumeIntegerOptional(reader),
} as ChiriTypeDefinition
