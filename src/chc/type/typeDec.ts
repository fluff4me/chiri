

import consumeDecimalOptional from "../read/consume/numeric/consumeDecimalOptional"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export default TypeDefinition({
	type: ChiriType.of("dec"),
	stringable: true,
	consumeOptionalConstructor: reader => consumeDecimalOptional(reader),
	coerce: (value, error) => {
		if (typeof value === "boolean")
			return value ? 1 : 0

		if (value === undefined || value === null)
			return 0

		if (typeof value === "number")
			return value

		throw error()
	},
	is: value => typeof value === "number",
})
