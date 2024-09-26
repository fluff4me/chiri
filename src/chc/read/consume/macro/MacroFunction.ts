import { INTERNAL_POSITION } from "../../../../constants"
import type { PromiseOr } from "../../../util/Type"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import type { ChiriType } from "../../ChiriType"
import type { ContextStatement } from "../body/BodyRegistry"
import type { ChiriContext } from "../body/Contexts"
import Contexts from "../body/Contexts"
import consumeBodyOptional from "../consumeBodyOptional"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
import type { ChiriExpressionOperand } from "../consumeExpression"
import consumeFunctionParameters from "../consumeFunctionParameters"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import consumeWordOptional from "../consumeWordOptional"

export interface ChiriMacroBase {
	type: string
	name: ChiriWord
	content: ChiriStatement[]
	position: ChiriPosition
}

export interface ChiriMacroInternal<T> extends ChiriMacroBase {
	type: "macro:internal"
	consumeOptional (reader: ChiriReader, bodyType: ChiriContext): Promise<T | undefined>
}

export interface ChiriMacroInternalConsumerInfo<NAMED extends boolean = false, BODY = null, EXTRA = never> {
	reader: ChiriReader
	assignments: Record<string, ChiriExpressionOperand>
	body: (BODY extends null ? never : BODY)[]
	name: NAMED extends true ? ChiriWord : undefined
	extra: EXTRA
	position: ChiriPosition
}

export type ChiriMacroInternalParametersConsumer<T> = (reader: ChiriReader) => PromiseOr<T>

export interface ChiriMacroInternalFactory<NAMED extends boolean = false, BODY = null, EXTRA = never> {
	usability (...types: ChiriContext[]): this
	consumeParameters<T> (consumer: ChiriMacroInternalParametersConsumer<T>): ChiriMacroInternalFactory<NAMED, BODY, T>
	named (): ChiriMacroInternalFactory<true, BODY>
	parameter (name: string, type: ChiriType, value?: ChiriExpressionOperand): this
	body<CONTEXT extends ChiriContext> (context: CONTEXT): ChiriMacroInternalFactory<NAMED, ContextStatement<CONTEXT>, EXTRA>
	consume<T> (consumer: (info: ChiriMacroInternalConsumerInfo<NAMED, BODY, EXTRA>) => T | undefined | Promise<T | undefined>): ChiriMacroInternal<T>
}

export default function (type: string): ChiriMacroInternalFactory {
	const parameters: ChiriCompilerVariable[] = []
	let parametersConsumer: ChiriMacroInternalParametersConsumer<any> | undefined
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
			return this as ChiriMacroInternalFactory<boolean, any> as ChiriMacroInternalFactory<true, any>
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
				expression: value,
			})
			return this
		},
		body<CONTEXT extends ChiriContext> (context: CONTEXT) {
			bodyContext = context
			return this as ChiriMacroInternalFactory<boolean, ContextStatement<CONTEXT>>
		},
		consume (consumer) {
			return {
				type: "macro:internal",
				name: { type: "word", value: type, position: INTERNAL_POSITION },
				position: INTERNAL_POSITION,
				content: parameters,
				async consumeOptional (reader, context) {
					const position = reader.getPosition()
					const savedPosition = reader.savePosition()
					const start = reader.i
					if (!reader.consumeOptional(`#${type}`))
						return undefined

					context = context === "inherit" ? reader.context : context
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

					const extra = await parametersConsumer?.(reader) as never
					const assignments = parametersConsumer ? {} : consumeFunctionParameters(reader, start, this)
					const body = bodyContext ? await consumeBodyOptional(reader, bodyContext) : []
					const result = await consumer({
						reader,
						assignments,
						body: body as [],
						name: name as undefined,
						extra,
						position,
					})

					if (!result)
						reader.restorePosition(savedPosition)

					return result
				},
			}
		},
	}
}
