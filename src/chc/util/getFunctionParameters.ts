import type { ChiriCompilerVariable } from "../read/consume/consumeCompilerVariableOptional"
import type { ChiriMacroBase } from "../read/consume/macro/MacroFunction"

export default (fn: ChiriMacroBase): ChiriCompilerVariable[] =>
	fn.content.filter((statement): statement is ChiriCompilerVariable =>
		statement.type === "variable" && statement.assignment !== "=")
