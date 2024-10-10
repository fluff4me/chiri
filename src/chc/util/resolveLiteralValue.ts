import type { ChiriLiteralValue } from "../read/consume/consumeTypeConstructorOptional"
import { ChiriType } from "../type/ChiriType"
import type ChiriCompiler from "../write/ChiriCompiler"
import type { default as resolveExpressionType } from "./resolveExpression"
import resolveExpression, { Record } from "./resolveExpression"
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
				.flatMap(content => {
					if (content.type !== "list-spread")
						return [resolveExpression(compiler, content)]

					const value = resolveExpression(compiler, content.value)
					if (!Array.isArray(value))
						throw compiler.error(content.position, `Unable to spread a value of type "${ChiriType.stringify(content.value.valueType)}"`)

					return value
				})

		case "record":
			return Object.fromEntries(expression.value
				.flatMap(content => {
					if (Array.isArray(content)) {
						const [key, value] = content
						return [[resolveLiteralValue.stringifyExpression(compiler, key), resolveExpression(compiler, value)]]
					}

					const value = resolveLiteralValue.resolveExpression(compiler, content)
					if (!Record.is(value))
						throw compiler.error(content.position, `Unable to spread a value of type "${ChiriType.stringify(content.valueType)}"`)

					return Object.entries(value)
				})) as Record

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
