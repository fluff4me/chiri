

import type { ChiriLiteralBool } from "../read/consume/consumeTypeConstructorOptional"
import consumeWordOptional from "../read/consume/consumeWordOptional"
import { ChiriType } from "./ChiriType"
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
	coerce: value => !!value,
})
