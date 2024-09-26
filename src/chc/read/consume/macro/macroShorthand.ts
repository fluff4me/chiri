import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import consumeWhiteSpace from "../consumeWhiteSpace"
import consumeWordInterpolated from "../consumeWordInterpolated"
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional"
import MacroConstruct from "./MacroConstruct"

export interface ChiriShorthand {
	type: "shorthand"
	property: ChiriWordInterpolated
	body: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("shorthand")
	.consumeParameters(reader => consumeWhiteSpace(reader) && consumeWordInterpolated(reader))
	.body("property-name")
	.consume(({ reader, body, position, extra }): ChiriShorthand => ({
		type: "shorthand",
		property: extra,
		body,
		position,
	}))
