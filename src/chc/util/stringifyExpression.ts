import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression"
import type ChiriCompiler from "../write/ChiriCompiler"
import type { Value } from "./resolveExpression"
import resolveExpression, { Record } from "./resolveExpression"
import resolveLiteralValue from "./resolveLiteralValue"

const stringifyExpression = (compiler: ChiriCompiler, expression?: ChiriExpressionOperand | Value): string => {
	if (expression === undefined)
		return ""

	const resolved = typeof expression === "object" && !Array.isArray(expression) && !Record.is(expression) ? resolveExpression(compiler, expression) : expression
	switch (typeof resolved) {
		case "number":
		case "boolean":
			return `${resolved}`
		case "undefined":
			return ""
		case "string":
			return resolved
	}

	if (Array.isArray(resolved))
		return resolved.map(v => stringifyExpression(compiler, v)).join(" ")

	if (Record.is(resolved))
		return Object.entries(resolved).map(([k, v]) => `${k}: ${stringifyExpression(compiler, v)}`).join(" ")

	throw compiler.error(undefined, `Expression resolved to unstringifiable type "${typeof resolved}"`)
}

resolveLiteralValue.stringifyExpression = stringifyExpression
resolveExpression.stringifyExpression = stringifyExpression

export default stringifyExpression
