

import consumeUnsignedIntegerOptional from "../read/consume/numeric/consumeUnsignedIntegerOptional"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export default TypeDefinition({
	type: ChiriType.of("uint"),
	stringable: true,
	consumeOptionalConstructor: reader => {
		const restore = reader.savePosition()
		const uint = consumeUnsignedIntegerOptional(reader)
		if (!uint)
			return undefined

		if (reader.peek(".")) {
			reader.restorePosition(restore)
			return undefined
		}

		return uint
	},
	coerce: (value, error) => {
		if (typeof value === "boolean")
			return value ? 1 : 0

		if (value === undefined || value === null)
			return 0

		if (typeof value === "number")
			return Math.max(0, Math.trunc(value))

		throw error()
	},
	is: value => typeof value === "number" && Number.isInteger(value) && value >= 0,
})
