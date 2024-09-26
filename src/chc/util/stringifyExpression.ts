import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression"
import type ChiriCompiler from "../write/ChiriCompiler"
import type { Value } from "./resolveExpression"
import resolveExpression from "./resolveExpression"
import resolveLiteralValue from "./resolveLiteralValue"

const stringifyExpression = (compiler: ChiriCompiler, expression?: ChiriExpressionOperand | Value): string => {
	if (expression === undefined)
		return ""

	const resolved = typeof expression === "object" && !Array.isArray(expression) ? resolveExpression(compiler, expression) : expression
	switch (typeof resolved) {
		case "number":
		case "boolean":
			return `${resolved}`
		case "undefined":
			return ""
		case "string":
			return resolved
		case "object":
			return resolved.join(" ")
		default:
			throw compiler.error(undefined, `Expression resolved to unstringifiable type "${typeof resolved}"`)
	}
}

resolveLiteralValue.stringifyExpression = stringifyExpression

export default stringifyExpression
