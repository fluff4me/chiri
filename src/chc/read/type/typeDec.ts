

import type { ChiriTypeDefinition } from "../ChiriTypeManager"
import consumeDecimalOptional from "../consume/numeric/consumeDecimalOptional"

export default {
	stringable: true,
	consumeOptionalConstructor: reader => consumeDecimalOptional(reader),
} as ChiriTypeDefinition
