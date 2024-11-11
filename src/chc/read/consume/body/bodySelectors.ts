import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import consumeWordInterpolated from "../consumeWordInterpolated"
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional"
import BodyConsumer from "./BodyConsumer"

export default BodyConsumer("selectors", reader => {
	const selectors: ChiriWordInterpolated[] = []
	do {
		reader.consume(".")
		selectors.push(consumeWordInterpolated(reader))
	} while (reader.consumeOptional(",") && (consumeWhiteSpaceOptional(reader) || true))

	return selectors
})
