import consumeWordInterpolated from "../consumeWordInterpolated"
import BodyConsumer from "./BodyConsumer"

export default BodyConsumer("selectors", reader => {
	reader.consume(".")
	return consumeWordInterpolated(reader)
})
