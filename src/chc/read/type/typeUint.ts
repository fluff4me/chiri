

import { ChiriType } from "../ChiriType"
import consumeIntegerOptional from "../consume/numeric/consumeUnsignedIntegerOptional"
import TypeDefinition from "./TypeDefinition"

export default TypeDefinition({
	type: ChiriType.of("uint"),
	stringable: true,
	consumeOptionalConstructor: reader => consumeIntegerOptional(reader),
})
