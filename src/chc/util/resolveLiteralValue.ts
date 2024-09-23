import type { ChiriExpressionOperand } from "../read/consume/consumeExpression"
import type { ChiriLiteralValue } from "../read/consume/consumeTypeConstructorOptional"
import type ChiriCompiler from "../write/ChiriCompiler"

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
		default:
			throw new Error(`Unable to resolve literal value type ${subType}`)
	}
}

namespace resolveLiteralValue {
	export let stringifyExpression: (compiler: ChiriCompiler, expression?: ChiriExpressionOperand | string | number | boolean) => string | undefined
}

export default resolveLiteralValue
