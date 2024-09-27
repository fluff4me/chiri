import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriType } from "../../ChiriType"
import consumeBlockEnd from "../consumeBlockEnd"
import consumeBlockStartOptional from "../consumeBlockStartOptional"
import consumeNewBlockLineOptional from "../consumeNewBlockLineOptional"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import consumeWordOptional from "../consumeWordOptional"
import type { ChiriExpressionOperand, ChiriExpressionResult } from "./consumeExpression"
import ExpressionConstruct from "./ExpressionConstruct"

export interface ChiriExpressionMatch {
	type: "match"
	value: ChiriExpressionOperand
	cases: ChiriExpressionMatchCase[]
	elseCase?: ChiriExpressionMatchElse
	position: ChiriPosition
	valueType: ChiriType
}

export interface ChiriExpressionMatchCase {
	type: "match-case"
	condition: ChiriExpressionOperand
	expression: ChiriExpressionResult
	position: ChiriPosition
}

export interface ChiriExpressionMatchElse {
	type: "match-else"
	expression: ChiriExpressionResult
	position: ChiriPosition
}

export default ExpressionConstruct("match")
	.consume(async ({ reader, consumeExpression, expectedTypes, position }): Promise<ChiriExpressionMatch | undefined> => {
		const value = consumeExpression.inline(reader)

		reader.consume(":")
		if (!consumeBlockStartOptional(reader))
			throw reader.error("Expected start of match cases block")

		const cases: ChiriExpressionMatchCase[] = []
		let elseCase: ChiriExpressionMatchElse | undefined
		do {
			const position = reader.getPosition()

			const isElseCase = consumeWordOptional(reader, "else")
			const condition = isElseCase ? undefined : consumeExpression.inline(reader)

			reader.consume(":")
			consumeWhiteSpaceOptional(reader)

			const expression = await consumeExpression(reader, ...expectedTypes)

			if (isElseCase)
				elseCase = {
					type: "match-else",
					expression,
					position,
				}

			else
				cases.push({
					type: "match-case",
					condition: condition!,
					expression,
					position,
				})
		} while (consumeNewBlockLineOptional(reader))

		consumeBlockEnd(reader)

		const valueTypes = cases.map(c => c.expression.valueType)
		if (elseCase) valueTypes.push(elseCase.expression.valueType)

		const intersection = reader.types.intersection(...valueTypes)

		return {
			type: "match",
			value,
			cases,
			elseCase,
			position,
			valueType: intersection,
		}
	})
