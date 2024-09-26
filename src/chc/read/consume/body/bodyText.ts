import consumeValue from "../consumeValueText"
import BodyConsumer from "./BodyConsumer"

export default BodyConsumer("text", reader => consumeValue(reader, false))
