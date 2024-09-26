import type { PromiseOr } from "../../../util/Type"
import type ChiriReader from "../../ChiriReader"
import type { ChiriType } from "../../ChiriType"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ExpressionOperandConsumer } from "./consumeExpression"

interface ExpressionConstruct<T> {
	consumeOptional (reader: ChiriReader, consumeExpression: ExpressionOperandConsumer, ...expectedTypes: ChiriType[]): Promise<T | undefined>
}

interface ExpressionConstructFactoryInfo {
	reader: ChiriReader
	consumeExpression: ExpressionOperandConsumer
	expectedTypes: ChiriType[]
}

interface ExpressionConstructFactory {
	consume<T> (consumer: (info: ExpressionConstructFactoryInfo) => PromiseOr<T | undefined>): ExpressionConstruct<T>
}

function ExpressionConstruct (name: string): ExpressionConstructFactory {
	return {
		consume: consumer => {
			return {
				consumeOptional: async (reader, consumeExpression, ...expectedTypes) => {
					const position = reader.savePosition()
					if (!reader.consumeOptional(name))
						return undefined

					if (!consumeWhiteSpaceOptional(reader))
						return undefined

					const result = await consumer({ reader, consumeExpression, expectedTypes })
					if (result === undefined)
						reader.restorePosition(position)

					return result
				},
			}
		},
	}
}

export default ExpressionConstruct
