

import { ChiriType } from "../ChiriType"
import consumeDecimalOptional from "../consume/numeric/consumeDecimalOptional"
import TypeDefinition from "./TypeDefinition"

export default TypeDefinition({
	type: ChiriType.of("dec"),
	stringable: true,
	consumeOptionalConstructor: reader => consumeDecimalOptional(reader),
})
