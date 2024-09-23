import consumeValue from "../consumeValueText"
import BodyFunction from "./BodyFunction"

export default BodyFunction("text", reader => consumeValue(reader, false))
