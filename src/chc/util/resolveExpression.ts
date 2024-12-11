import type { ChiriExpressionResult } from "../read/consume/expression/consumeExpression"
import makeLiteralInt from "../read/factory/makeLiteralInt"
import type ChiriCompiler from "../write/ChiriCompiler"
import resolveLiteralValue, { resolveLiteralRange } from "./resolveLiteralValue"
import type { default as stringifyExpressionType } from "./stringifyExpression"
import type { default as stringifyTextType } from "./stringifyText"

export const SYMBOL_IS_RECORD = Symbol("IS_RECORD")
export type Literal = undefined | number | boolean | string
export type Record = { [KEY in string]: Literal | Literal[] } & { [SYMBOL_IS_RECORD]: true }
export type Value = Literal | Value[] | Record

export namespace Record {
	export function is (value: unknown): value is Record {
		return typeof value === "object" && !!value && (value as Record)[SYMBOL_IS_RECORD]
	}
}

function resolveExpression (compiler: ChiriCompiler, expression?: ChiriExpressionResult): Value {
	if (!expression)
		return undefined

	switch (expression.type) {
		case "literal":
			if (expression.subType === "function")
				return compiler.getFunction(expression.name.value, expression.name.position) as any

			return resolveLiteralValue(compiler, expression)

		case "text":
			return resolveExpression.stringifyText(compiler, expression)

		case "get":
			return compiler.getVariable(expression.name.value, expression.name.position)

		case "function-call":
			return compiler.callFunction(expression)

		case "get-by-key": {
			const obj = resolveExpression(compiler, expression.value)
			let key = resolveExpression.stringifyExpression(compiler, expression.key)
			if (!Record.is(obj) && !Array.isArray(obj))
				throw compiler.error(`Cannot access value in "${key}" of "${resolveExpression.stringifyExpression(compiler, expression.value)}"`)

			if (Array.isArray(obj)) {
				let index = +key
				index = index < 0 ? obj.length + index : index
				key = `${index}`
			}

			return obj[key as keyof typeof obj] as Value
		}

		case "list-slice": {
			const list = resolveExpression(compiler, expression.list)
			if (!Array.isArray(list))
				throw compiler.error("Cannot create list slice, invalid list")

			expression.range.end ??= makeLiteralInt(list.length)

			const range = resolveLiteralRange(compiler, expression.range, list)
			if (!Array.isArray(range))
				throw compiler.error("Cannot create list slice, invalid range")

			const result: Value[] = []
			for (let index of range) {
				if (typeof index !== "number")
					throw compiler.error("Cannot create list slice, provided index is not an integer")

				index = index < 0 ? range.length + index : index
				result.push(list[Math.max(0, Math.min(index, list.length - 1))])
			}

			return result
		}

		case "match": {
			const value = resolveExpression(compiler, expression.value)
			for (const matchCase of expression.cases)
				if (resolveExpression(compiler, matchCase.condition) === value)
					return resolveExpression(compiler, matchCase.expression)

			if (!expression.elseCase)
				throw compiler.error(expression.position, "No cases of match expression matched, add an else case")

			return resolveExpression(compiler, expression.elseCase.expression)
		}

		case "pipe": {
			const left = resolveExpression(compiler, expression.left)
			compiler.pipeValueStack.push(left)
			const result = resolveExpression(compiler, expression.right)
			compiler.pipeValueStack.pop()
			return result
		}

		case "pipe-use-left":
			return compiler.pipeValueStack.at(-1)

		case "conditional":
			return resolveExpression(compiler, expression.condition)
				? resolveExpression(compiler, expression.ifTrue)
				: resolveExpression(compiler, expression.ifFalse)

		case "expression":
			switch (expression.subType) {
				case "unary": {
					const operand: any = resolveExpression(compiler, expression.operand)
					switch (expression.operator) {
						case "!":
							return !operand
						case "+":
							return +operand
						case "-":
							return -operand
						case "~":
							return ~operand
						case "exists":
							return operand !== undefined
						default:
							throw compiler.error(undefined, `Unable to resolve unary operator "${expression.operator}"`)
					}
				}
				case "binary": {
					const operandA: any = resolveExpression(compiler, expression.operandA)
					const operandB: any = resolveExpression(compiler, expression.operandB)
					switch (expression.operator) {
						case "+":
							return operandA + operandB
						case "-":
							return operandA - operandB
						case "*":
							return operandA * operandB
						case "/":
							if (operandB === 0)
								return Infinity
							return operandA / operandB
						case "%":
							// TODO maybe add an operator for normal %?
							return ((operandA % operandB) + operandB) % operandB
						case "**":
							return operandA ** operandB
						case "==":
							return operandA === operandB
						case "!=":
							return operandA !== operandB
						case "||":
							return operandA || operandB
						case "&&":
							return operandA && operandB
						case "|":
							return operandA | operandB
						case "&":
							return operandA & operandB
						case "^":
							return operandA ^ operandB
						case "<=":
							return operandA <= operandB
						case ">=":
							return operandA >= operandB
						case "<":
							return operandA < operandB
						case ">":
							return operandA > operandB
						case ".":
							return `${operandA}${operandB}`
						case "x":
							return `${operandA}`.repeat(+operandB || 1)
						case "??":
							return operandA ?? operandB
						case "<<":
							return operandA << operandB
						case ">>":
							return operandA >> operandB
						case ">>>":
							return operandA >>> operandB
						case "is":
							return compiler.types.types[operandB as string].is?.(operandA as Value) ?? false
						default:
							throw compiler.error(undefined, `Unable to resolve binary operator "${expression.operator}"`)
					}
				}
			}
	}

	// @ts-expect-error Assert we never get here
	expression = expression as ChiriExpressionResult
	// @ts-expect-error ___
	throw compiler.error(expression.position, `Cannot compile expression result type "${expression.type}" yet`)
}

namespace resolveExpression {
	export let stringifyText: typeof stringifyTextType
	export let stringifyExpression: typeof stringifyExpressionType
}

resolveLiteralValue.resolveExpression = resolveExpression

export default resolveExpression
