import consumeValueText from "../consumeValueText"
import BodyConsumer from "./BodyConsumer"

export default BodyConsumer("text", reader => consumeValueText(reader, false))
