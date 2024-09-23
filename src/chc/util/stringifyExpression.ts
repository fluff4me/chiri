import type { ChiriExpressionOperand } from "../read/consume/consumeExpression"
import type ChiriCompiler from "../write/ChiriCompiler"
import resolveExpression from "./resolveExpression"
import resolveLiteralValue from "./resolveLiteralValue"

const stringifyExpression = (compiler: ChiriCompiler, expression?: ChiriExpressionOperand | string | number | boolean): string => {
	if (expression === undefined)
		return ""

	const resolved = typeof expression === "object" ? resolveExpression(compiler, expression) : expression
	switch (typeof resolved) {
		case "number":
		case "boolean":
			return `${resolved}`
		case "undefined":
			return ""
		case "string":
			return resolved
		default:
			throw compiler.error(undefined, `Expression resolved to unstringifiable type "${typeof resolved}"`)
	}
}

resolveLiteralValue.stringifyExpression = stringifyExpression

export default stringifyExpression
