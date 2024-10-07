import consumeKeyframe from "../consumeKeyframe"
import BodyConsumer from "./BodyConsumer"

export default BodyConsumer("keyframes", async reader => await consumeKeyframe(reader))
