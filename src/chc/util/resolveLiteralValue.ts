import type { ChiriLiteralValue } from "../read/consume/consumeTypeConstructorOptional"
import type ChiriCompiler from "../write/ChiriCompiler"
import type { default as resolveExpressionType } from "./resolveExpression"
import resolveExpression from "./resolveExpression"
import type { default as stringifyExpressionType } from "./stringifyExpression"

function resolveLiteralValue (compiler: ChiriCompiler, expression: ChiriLiteralValue) {
	const subType = expression.subType
	switch (subType) {
		case "dec":
		case "int":
		case "uint":
			return +expression.value
		case "bool":
			return expression.value
		case "undefined":
			return undefined
		case "string":
			return expression.segments
				.map(segment => typeof segment === "string" ? segment : resolveLiteralValue.stringifyExpression?.(compiler, segment))
				.join("")
		case "list":
			return expression.value
				.map(value => resolveExpression(compiler, value))
		default: {
			const e2 = expression as ChiriLiteralValue
			throw compiler.error(e2.position, `Unable to resolve literal value type ${e2.subType}`)
		}
	}
}

namespace resolveLiteralValue {
	export let stringifyExpression: typeof stringifyExpressionType
	export let resolveExpression: typeof resolveExpressionType
}

export default resolveLiteralValue
