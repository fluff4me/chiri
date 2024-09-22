import consumeValue from "../consumeValue"
import BodyFunction from "./BodyFunction"

export default BodyFunction("text", reader => consumeValue(reader, false))
