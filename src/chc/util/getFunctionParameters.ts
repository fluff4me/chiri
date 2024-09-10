import type { ChiriCompilerVariable, ChiriFunctionBase } from "../ChiriAST"

export default (fn: ChiriFunctionBase): ChiriCompilerVariable[] =>
	fn.content.filter((statement): statement is ChiriCompilerVariable =>
		statement.type === "variable" && statement.assignment !== "=")
