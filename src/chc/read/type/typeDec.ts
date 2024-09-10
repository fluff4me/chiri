

import { ChiriTypeDefinition } from "../ChiriTypeManager";
import consumeDecimalOptional from "../consume/consumeDecimalOptional";

export default {
	stringable: true,
	consumeOptionalConstructor: reader => consumeDecimalOptional(reader),
} as ChiriTypeDefinition;
