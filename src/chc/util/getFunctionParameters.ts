import type { ChiriCompilerVariable } from "../read/consume/consumeCompilerVariableOptional"
import type { ChiriFunctionBase } from "../read/consume/macro/MacroFunction"

export default (fn: ChiriFunctionBase): ChiriCompilerVariable[] =>
	fn.content.filter((statement): statement is ChiriCompilerVariable =>
		statement.type === "variable" && statement.assignment !== "=")
