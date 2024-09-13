import consumeWordInterpolatedOptional from "../consumeWordInterpolatedOptional"
import BodyFunction from "./BodyFunction"

export default BodyFunction(reader => consumeWordInterpolatedOptional(reader))
