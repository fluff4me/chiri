import type { PromiseOr } from "../../../util/Type"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriType } from "../../ChiriType"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type consumeExpression from "./consumeExpression"

interface ExpressionConstruct<T> {
	consumeOptional (reader: ChiriReader, expressionConsumer: typeof consumeExpression, ...expectedTypes: ChiriType[]): Promise<T | undefined>
}

interface ExpressionConstructFactoryInfo {
	reader: ChiriReader
	consumeExpression: typeof consumeExpression
	expectedTypes: ChiriType[]
	position: ChiriPosition
}

interface ExpressionConstructFactory {
	consume<T> (consumer: (info: ExpressionConstructFactoryInfo) => PromiseOr<T | undefined>): ExpressionConstruct<T>
}

function ExpressionConstruct (name: string): ExpressionConstructFactory {
	return {
		consume: consumer => {
			return {
				consumeOptional: async (reader, consumeExpression, ...expectedTypes) => {
					const position = reader.getPosition()
					const restore = reader.savePosition()
					if (!reader.consumeOptional(name))
						return undefined

					if (!consumeWhiteSpaceOptional(reader))
						return undefined

					const result = await consumer({ reader, consumeExpression, expectedTypes, position })
					if (result === undefined)
						reader.restorePosition(restore)

					return result
				},
			}
		},
	}
}

export default ExpressionConstruct
