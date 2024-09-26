import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriType } from "../../ChiriType"
import type { ChiriExpressionOperand } from "./consumeExpression"
import ExpressionConstruct from "./ExpressionConstruct"

export interface ChiriExpressionMatch {
	type: "match"
	value: ChiriExpressionOperand
	cases: ChiriExpressionMatchCase[]
	elseCase?: ChiriExpressionMatchCase
	position: ChiriPosition
	valueType: ChiriType
}

export interface ChiriExpressionMatchCase {
	type: "match-case"
	condition: ChiriExpressionOperand
	position: ChiriPosition
}

export default ExpressionConstruct("match")
	.consume(({ reader, consumeExpression, expectedTypes }): ChiriExpressionMatch | undefined => {
		return undefined
	})
