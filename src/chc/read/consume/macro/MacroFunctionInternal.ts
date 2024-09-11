import { INTERNAL_POSITION } from "../../../../constants"
import type { ChiriCompilerVariable, ChiriExpressionOperand, ChiriFunctionBase, ChiriStatement, ChiriWord } from "../../../ChiriAST"
import type ChiriReader from "../../ChiriReader"
import type { ChiriType } from "../../ChiriType"
import type { ChiriFunctionBodyConsumer } from "../consumeFunctionBodyOptional"
import consumeFunctionBodyOptional from "../consumeFunctionBodyOptional"
import consumeFunctionParameters from "../consumeFunctionParameters"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import consumeWordOptional from "../consumeWordOptional"

export interface ChiriFunctionInternal<T> extends ChiriFunctionBase {
	type: "function:internal"
	consumeOptional (reader: ChiriReader): Promise<T | undefined>
}

export interface ChiriFunctionInternalConsumerInfo<NAMED extends boolean = false, BODY = null, EXTRA = never> {
	reader: ChiriReader
	assignments: Record<string, ChiriExpressionOperand>
	body: BODY extends null ? [] : BODY[]
	name: NAMED extends true ? ChiriWord : undefined
	extra: EXTRA
}

export type ChiriFunctionInternalParametersConsumer<T> = (reader: ChiriReader) => T

export interface ChiriFunctionInternalFactory<NAMED extends boolean = false, BODY = null, EXTRA = never> {
	consumeParameters<T> (consumer: ChiriFunctionInternalParametersConsumer<T>): ChiriFunctionInternalFactory<NAMED, BODY, T>
	named (): ChiriFunctionInternalFactory<true, BODY>
	parameter (name: string, type: ChiriType): this
	body (): ChiriFunctionInternalFactory<NAMED, ChiriStatement>
	body<T> (consumer: (reader: ChiriReader) => T | undefined): ChiriFunctionInternalFactory<NAMED, T>
	consume<T> (consumer: (info: ChiriFunctionInternalConsumerInfo<NAMED, BODY, EXTRA>) => T | undefined | Promise<T | undefined>): ChiriFunctionInternal<T>
}

export default function (type: string): ChiriFunctionInternalFactory {
	const parameters: ChiriCompilerVariable[] = []
	let parametersConsumer: ChiriFunctionInternalParametersConsumer<any> | undefined
	let bodyConsumer: ChiriFunctionBodyConsumer<any> | undefined | null = null
	let named = false
	return {
		named () {
			named = true
			return this as ChiriFunctionInternalFactory<boolean, any> as ChiriFunctionInternalFactory<true, any>
		},
		consumeParameters (consumer) {
			parametersConsumer = consumer
			return this
		},
		parameter (name, type) {
			parameters.push({
				type: "variable",
				name: { type: "word", value: name, position: INTERNAL_POSITION },
				valueType: type,
				position: INTERNAL_POSITION,
			})
			return this
		},
		body<T> (consumer?: ChiriFunctionBodyConsumer<T>) {
			bodyConsumer = consumer
			return this as ChiriFunctionInternalFactory<boolean, T>
		},
		consume (consumer) {
			return {
				type: "function:internal",
				name: { type: "word", value: type, position: INTERNAL_POSITION },
				content: parameters,
				async consumeOptional (reader) {
					const savedPosition = reader.savePosition()
					const start = reader.i
					if (!reader.consumeOptional(`#${type}`))
						return undefined

					let name: ChiriWord | undefined
					if (named) {
						if (!consumeWhiteSpaceOptional(reader))
							throw reader.error("Expected declaration name")

						name = consumeWordOptional(reader)
						if (!name)
							throw reader.error("Expected declaration name")
					}

					const extra = parametersConsumer?.(reader) as never
					const assignments = parametersConsumer ? {} : consumeFunctionParameters(reader, start, this)
					const body = bodyConsumer !== null ? await consumeFunctionBodyOptional(reader, bodyConsumer!) : []
					const result = await consumer({
						reader,
						assignments,
						body: body as [],
						name: name as undefined,
						extra,
					})

					if (!result)
						reader.restorePosition(savedPosition)

					return result
				},
			}
		},
	}
}
