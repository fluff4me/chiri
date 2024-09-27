

import { ChiriType } from "../ChiriType"
import type { ChiriLiteralBool } from "../consume/consumeTypeConstructorOptional"
import consumeWordOptional from "../consume/consumeWordOptional"
import TypeDefinition from "./TypeDefinition"

export default TypeDefinition({
	type: ChiriType.of("bool"),
	stringable: true,
	consumeOptionalConstructor: (reader): ChiriLiteralBool | undefined => {
		const bool = consumeWordOptional(reader, "true", "false")
		return !bool ? undefined : {
			type: "literal",
			subType: "bool",
			valueType: ChiriType.of("bool"),
			value: bool.value === "true" ? true : false,
			position: bool.position,
		}
	},
})
