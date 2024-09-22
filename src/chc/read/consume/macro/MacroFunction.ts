import { INTERNAL_POSITION } from "../../../../constants"
import type { ChiriCompilerVariable, ChiriExpressionOperand, ChiriFunctionBase, ChiriWord } from "../../../ChiriAST"
import type ChiriReader from "../../ChiriReader"
import type { ChiriType } from "../../ChiriType"
import type { ContextStatement } from "../body/BodyRegistry"
import BodyRegistry from "../body/BodyRegistry"
import type { ChiriContext } from "../body/Contexts"
import Contexts from "../body/Contexts"
import consumeBodyOptional from "../consumeBodyOptional"
import consumeFunctionParameters from "../consumeFunctionParameters"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import consumeWordOptional from "../consumeWordOptional"

export interface ChiriFunctionInternal<T> extends ChiriFunctionBase {
	type: "function:internal"
	consumeOptional (reader: ChiriReader, bodyType: ChiriContext): Promise<T | undefined>
}

export interface ChiriFunctionInternalConsumerInfo<NAMED extends boolean = false, BODY = null, EXTRA = never> {
	reader: ChiriReader
	assignments: Record<string, ChiriExpressionOperand>
	body: (BODY extends null ? never : BODY)[]
	name: NAMED extends true ? ChiriWord : undefined
	extra: EXTRA
}

export type ChiriFunctionInternalParametersConsumer<T> = (reader: ChiriReader) => T

export interface ChiriFunctionInternalFactory<NAMED extends boolean = false, BODY = null, EXTRA = never> {
	usability (...types: ChiriContext[]): this
	consumeParameters<T> (consumer: ChiriFunctionInternalParametersConsumer<T>): ChiriFunctionInternalFactory<NAMED, BODY, T>
	named (): ChiriFunctionInternalFactory<true, BODY>
	parameter (name: string, type: ChiriType, value?: ChiriExpressionOperand): this
	body<CONTEXT extends ChiriContext> (context: CONTEXT): ChiriFunctionInternalFactory<NAMED, ContextStatement<CONTEXT>>
	consume<T> (consumer: (info: ChiriFunctionInternalConsumerInfo<NAMED, BODY, EXTRA>) => T | undefined | Promise<T | undefined>): ChiriFunctionInternal<T>
}

export default function (type: string): ChiriFunctionInternalFactory {
	const parameters: ChiriCompilerVariable[] = []
	let parametersConsumer: ChiriFunctionInternalParametersConsumer<any> | undefined
	let bodyContext: ChiriContext | undefined
	let named = false
	let usability = Contexts.slice()
	return {
		usability (...types) {
			usability = types
			return this
		},
		named () {
			named = true
			return this as ChiriFunctionInternalFactory<boolean, any> as ChiriFunctionInternalFactory<true, any>
		},
		consumeParameters (consumer) {
			parametersConsumer = consumer
			return this
		},
		parameter (name, type, value) {
			parameters.push({
				type: "variable",
				name: { type: "word", value: name, position: INTERNAL_POSITION },
				valueType: type,
				assignment: "??=",
				position: INTERNAL_POSITION,
			})
			return this
		},
		body<CONTEXT extends ChiriContext> (context: CONTEXT) {
			bodyContext = context
			return this as ChiriFunctionInternalFactory<boolean, ContextStatement<CONTEXT>>
		},
		consume (consumer) {
			return {
				type: "function:internal",
				name: { type: "word", value: type, position: INTERNAL_POSITION },
				content: parameters,
				async consumeOptional (reader, context) {
					const savedPosition = reader.savePosition()
					const start = reader.i
					if (!reader.consumeOptional(`#${type}`))
						return undefined

					if (!usability.includes(context))
						throw reader.error(`#${type} cannot be used in "${context}" context`)

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
					const body = bodyContext ? await consumeBodyOptional<any>(reader, BodyRegistry[bodyContext]!) : []
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
