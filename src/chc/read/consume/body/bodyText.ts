import consumeValue from "../consumeValue"
import BodyFunction from "./BodyFunction"

export default BodyFunction(reader => consumeValue(reader, false))
