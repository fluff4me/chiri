import type { ChiriStatement } from "../../ChiriReader"
import macroReturn from "../macro/macroReturn"
import BodyConsumer from "./BodyConsumer"

export default BodyConsumer("function", async (reader): Promise<ChiriStatement | undefined> => undefined
	?? await macroReturn.consumeOptional(reader)
	?? undefined)
