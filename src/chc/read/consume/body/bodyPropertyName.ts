import consumeWordInterpolatedOptional from "../consumeWordInterpolatedOptional"
import BodyConsumer from "./BodyConsumer"

export default BodyConsumer("property-name", reader => consumeWordInterpolatedOptional(reader))
