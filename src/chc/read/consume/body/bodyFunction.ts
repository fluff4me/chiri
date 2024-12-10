import _ from "../../../util/_"
import type { ChiriStatement } from "../../ChiriReader"
import macroReturn from "../macro/macroReturn"
import BodyConsumer from "./BodyConsumer"

export default BodyConsumer("function", async (reader): Promise<ChiriStatement | undefined> => _
	?? await macroReturn.consumeOptional(reader)
	?? undefined)
