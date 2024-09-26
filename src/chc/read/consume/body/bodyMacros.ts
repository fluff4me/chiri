import consumeMacroUseOptional from "../consumeMacroUseOptional"
import BodyConsumer from "./BodyConsumer"
import type { ChiriContextSpreadable } from "./Contexts"

export default BodyConsumer("inherit", (reader, ...context: ChiriContextSpreadable) => consumeMacroUseOptional(reader, ...context))
