import consumeWordInterpolatedOptional from "../consumeWordInterpolatedOptional"
import BodyFunction from "./BodyFunction"

export default BodyFunction("shorthand", reader => consumeWordInterpolatedOptional(reader))
