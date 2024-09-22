import consumeMacroUseOptional from "../consumeMacroUseOptional"
import BodyFunction from "./BodyFunction"
import type { ChiriContext } from "./Contexts"

export default BodyFunction("inherit", (reader, type: ChiriContext) => consumeMacroUseOptional(reader, type))
