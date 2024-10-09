import { INTERNAL_POSITION } from "../../../constants"
import type { ChiriWord } from "../consume/consumeWord"

export default (value: string, position = INTERNAL_POSITION): ChiriWord => ({
	type: "word",
	value,
	position,
})
