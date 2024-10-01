import type { ChiriExpressionResult } from "../read/consume/expression/consumeExpression"
import type ChiriCompiler from "../write/ChiriCompiler"
import resolveLiteralValue from "./resolveLiteralValue"

export type Literal = undefined | number | boolean | string
export type Value = Literal | Value[]
const resolveExpression = (compiler: ChiriCompiler, expression?: ChiriExpressionResult): Value => {
	if (!expression)
		return undefined

	switch (expression.type) {
		case "literal":
			return resolveLiteralValue(compiler, expression)

		case "get":
			return compiler.getVariable(expression.name.value, expression.name.position)

		case "function-call":
			return compiler.callFunction(expression)

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
						default:
							throw compiler.error(undefined, `Unable to resolve binary operator "${expression.operator}"`)
					}
				}
			}
	}

	throw compiler.error(expression.position, `Cannot compile expression result type "${expression.type}" yet`)
}

resolveLiteralValue.resolveExpression = resolveExpression

export default resolveExpression
