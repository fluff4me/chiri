import type { ChiriLiteralValue } from "../read/consume/consumeTypeConstructorOptional"
import type { ChiriLiteralRange } from "../read/consume/expression/consumeRangeOptional"
import { ChiriType } from "../type/ChiriType"
import type ChiriCompiler from "../write/ChiriCompiler"
import type { default as resolveExpressionType } from "./resolveExpression"
import resolveExpression, { Record, SYMBOL_IS_RECORD } from "./resolveExpression"
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

		case "range":
			return resolveLiteralRange(compiler, expression)

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
			return Object.assign(Object.fromEntries(expression.value
				.flatMap(content => {
					if (Array.isArray(content)) {
						const [key, value] = content
						return [[resolveLiteralValue.stringifyExpression(compiler, key), resolveExpression(compiler, value)]]
					}

					const value = resolveLiteralValue.resolveExpression(compiler, content)
					if (!Record.is(value))
						throw compiler.error(content.position, `Unable to spread a value of type "${ChiriType.stringify(content.valueType)}"`)

					return Object.entries(value)
				})), { [SYMBOL_IS_RECORD]: true }) as Record

		default: {
			const e2 = expression as ChiriLiteralValue
			throw compiler.error(e2.position, `Unable to resolve literal value type ${e2.subType}`)
		}
	}
}

export function resolveLiteralRange (compiler: ChiriCompiler, range: ChiriLiteralRange, list?: string | any[]) {
	let startRaw = resolveLiteralValue.resolveExpression(compiler, range.start)
	if (startRaw !== undefined && !Number.isInteger(startRaw))
		throw compiler.error(range.position, "Invalid value for range start bound")

	let endRaw = resolveLiteralValue.resolveExpression(compiler, range.end)
	if (endRaw !== undefined && !Number.isInteger(endRaw))
		throw compiler.error(range.position, "Invalid value for range end bound")

	if (list && (startRaw as number >= list.length))
		return []

	startRaw ??= 0
	endRaw ??= list?.length

	const listLength = list?.length ?? 0
	let start = startRaw as number
	start = start < 0 ? listLength + start : start
	start = !list ? start : Math.max(0, Math.min(start, listLength - 1))

	let end = endRaw as number
	end = end < 0 ? listLength + end : end
	end = !list ? end
		: range.inclusive ? Math.max(0, Math.min(end, listLength - 1))
			: Math.max(-1, Math.min(end, listLength))

	const result: number[] = []
	if (range.inclusive)
		if (start < end)
			for (let i = start; i <= end; i++)
				result.push(i)
		else
			for (let i = start; i >= end; i--)
				result.push(i)

	else
		if (start < end)
			for (let i = start; i < end; i++)
				result.push(i)
		else
			for (let i = start; i > end; i--)
				result.push(i)

	return result
}

namespace resolveLiteralValue {
	export let stringifyExpression: typeof stringifyExpressionType
	export let resolveExpression: typeof resolveExpressionType
}

export default resolveLiteralValue
