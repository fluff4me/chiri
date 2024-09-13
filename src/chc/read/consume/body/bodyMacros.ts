import consumeMacroUseOptional from "../consumeMacroUseOptional"
import BodyFunction from "./BodyFunction"
import type { BodyType } from "./BodyTypes"

export default BodyFunction((reader, type: BodyType) => consumeMacroUseOptional(reader, type))
