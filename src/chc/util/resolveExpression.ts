import type { ChiriExpressionOperand } from "../read/consume/expression/consumeExpression"
import type ChiriCompiler from "../write/ChiriCompiler"
import resolveLiteralValue from "./resolveLiteralValue"

export type Literal = undefined | number | boolean | string
export type Value = Literal | Value[]
const resolveExpression = (compiler: ChiriCompiler, expression?: ChiriExpressionOperand): Value => {
	if (!expression)
		return undefined

	switch (expression.type) {
		case "literal":
			return resolveLiteralValue(compiler, expression)

		case "get":
			return compiler.getVariable(expression.name.value, expression.name.position)

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
						default:
							throw compiler.error(undefined, `Unable to resolve binary operator "${expression.operator}"`)
					}
				}
			}
	}
}

resolveLiteralValue.resolveExpression = resolveExpression

export default resolveExpression
