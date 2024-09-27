

import { ChiriType } from "../ChiriType"
import consumeIntegerOptional from "../consume/numeric/consumeIntegerOptional"
import TypeDefinition from "./TypeDefinition"

export default TypeDefinition({
	type: ChiriType.of("int"),
	stringable: true,
	consumeOptionalConstructor: reader => consumeIntegerOptional(reader),
})
