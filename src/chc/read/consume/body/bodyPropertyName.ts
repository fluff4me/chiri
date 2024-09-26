import consumeWordInterpolatedOptional from "../consumeWordInterpolatedOptional"
import BodyFunction from "./BodyFunction"

export default BodyFunction("property-name", reader => consumeWordInterpolatedOptional(reader))
