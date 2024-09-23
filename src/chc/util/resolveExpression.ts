import type { ChiriExpressionOperand } from "../read/consume/consumeExpression"
import type ChiriCompiler from "../write/ChiriCompiler"
import resolveLiteralValue from "./resolveLiteralValue"

const resolveExpression = (compiler: ChiriCompiler, expression?: ChiriExpressionOperand): undefined | number | boolean | string => {
	if (!expression)
		return undefined

	switch (expression.type) {
		case "literal":
			return resolveLiteralValue(compiler, expression)

		case "get":
			return compiler.getVariable(expression.name.value)

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
							throw compiler.error(`Unable to resolve unary operator "${expression.operator}"`)
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
							return operandA % operandB
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
							throw compiler.error(`Unable to resolve binary operator "${expression.operator}"`)
					}
				}
			}
	}
}

export default resolveExpression
