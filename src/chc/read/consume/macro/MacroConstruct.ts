import { INTERNAL_POSITION } from "../../../../constants"
import type { ChiriType } from "../../../type/ChiriType"
import type { PromiseOr } from "../../../util/Type"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import type { ContextStatement } from "../body/BodyRegistry"
import type { ChiriContextSpreadable, ChiriContextType, ChiriContextTypeWithData, ChiriContextTypeWithoutData, ContextData, ResolveContextDataTuple } from "../body/Contexts"
import Contexts from "../body/Contexts"
import consumeBodyOptional from "../consumeBodyOptional"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
import consumeMacroParameters from "../consumeMacroParameters"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriWord } from "../consumeWord"
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional"
import consumeWordOptional from "../consumeWordOptional"
import type { ChiriExpressionOperand } from "../expression/consumeExpression"

export interface ChiriMacroBase {
	type: string
	name: ChiriWord
	content: ChiriStatement[]
	position: ChiriPosition
}

export interface ChiriMacroInternal<T> extends ChiriMacroBase {
	type: "macro:internal"
	consumeOptional (reader: ChiriReader): Promise<T | undefined>
	consumeOptional<CONTEXT extends ChiriContextType> (reader: ChiriReader, context: CONTEXT, ...data: ResolveContextDataTuple<CONTEXT>): Promise<T | undefined>
	consumeOptional (reader: ChiriReader, ...context: ChiriContextSpreadable): Promise<T | undefined>
}

export interface ChiriMacroInternalConsumerInfo<NAMED extends NameType = undefined, BODY = null, EXTRA = never> {
	reader: ChiriReader
	assignments: Record<string, ChiriExpressionOperand>
	body: (BODY extends null ? never : BODY)[]
	name: NAMED extends "plain" ? ChiriWord : NAMED extends "interpolated" ? ChiriWordInterpolated : undefined
	extra: EXTRA
	position: ChiriPosition
	start: number
}

type NameType = "plain" | "interpolated" | undefined
export type ChiriMacroInternalBodyContextSupplierInfo<NAMED extends NameType = undefined, EXTRA = never> =
	Omit<ChiriMacroInternalConsumerInfo<NAMED, null, EXTRA>, "body">

export type ChiriMacroInternalParametersConsumer<T> = (reader: ChiriReader) => PromiseOr<T>

export interface ChiriMacroInternalFactory<NAMED extends NameType = undefined, BODY = null, EXTRA = never> {
	usability (...types: ChiriContextType[]): this
	/**
	 * Note: This does not consume white space for you, in case the parameters are optional
	 */
	consumeParameters<T> (consumer: ChiriMacroInternalParametersConsumer<T>): ChiriMacroInternalFactory<NAMED, BODY, T>
	named (): ChiriMacroInternalFactory<"plain", BODY>
	named (allowInterpolations: true): ChiriMacroInternalFactory<"interpolated", BODY>
	parameter (name: string, type: ChiriType, value?: ChiriExpressionOperand): this
	body<CONTEXT extends ChiriContextTypeWithoutData> (context: CONTEXT): ChiriMacroInternalFactory<NAMED, ContextStatement<CONTEXT>, EXTRA>
	body<CONTEXT extends ChiriContextTypeWithData> (context: CONTEXT, data: (info: ChiriMacroInternalBodyContextSupplierInfo<NAMED, EXTRA>) => ContextData[CONTEXT]): ChiriMacroInternalFactory<NAMED, ContextStatement<CONTEXT>, EXTRA>
	consume<T> (consumer: (info: ChiriMacroInternalConsumerInfo<NAMED, BODY, EXTRA>) => T | undefined | Promise<T | undefined>): ChiriMacroInternal<T>
}

export default function (macroName: string): ChiriMacroInternalFactory {
	const parameters: ChiriCompilerVariable[] = []
	let parametersConsumer: ChiriMacroInternalParametersConsumer<any> | undefined
	type ContextTuple = [ChiriContextType, ((info: ChiriMacroInternalBodyContextSupplierInfo<NameType, any>) => ContextData[ChiriContextType])?]
	let bodyContext: ContextTuple | undefined
	let named = false
	let usability = Contexts.slice()
	return {
		usability (...types) {
			usability = types
			return this
		},
		named () {
			named = true
			return this as ChiriMacroInternalFactory<NameType, any>
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
		body (...data: any[]) {
			bodyContext = data as ContextTuple
			return this
		},
		consume (consumer) {
			const macro: ChiriMacroInternal<any> = {
				type: "macro:internal",
				name: { type: "word", value: macroName, position: INTERNAL_POSITION },
				position: INTERNAL_POSITION,
				content: parameters,
				async consumeOptional (reader: ChiriReader, ...contextTuple: any[]) {
					const [useContextType, useContextData] = contextTuple as ChiriContextSpreadable
					const useContext = !useContextType || useContextType === "inherit" ? reader.context : { type: useContextType, data: useContextData }

					const position = reader.getPosition()
					const savedPosition = reader.savePosition()
					const start = reader.i
					if (!reader.consumeOptional(`#${macroName}`))
						return undefined

					if (!usability.includes(useContext.type))
						throw reader.error(`#${useContextType} cannot be used in "${useContext.type}" context`)

					let name: ChiriWord | undefined
					if (named) {
						if (!consumeWhiteSpaceOptional(reader))
							throw reader.error("Expected declaration name")

						name = consumeWordOptional(reader)
						if (!name)
							throw reader.error("Expected declaration name")
					}

					const extra = await parametersConsumer?.(reader) as never
					const assignments = parametersConsumer ? {} : consumeMacroParameters(reader, start, macro)

					const info: ChiriMacroInternalBodyContextSupplierInfo<NameType, never> & Partial<ChiriMacroInternalConsumerInfo<NameType, any, never>> = {
						reader,
						assignments,
						name: name as undefined,
						extra,
						position,
						start,
					}

					const [contextType, contextData] = bodyContext ?? []
					const context = !contextType ? undefined : contextType === "inherit" ? reader.context : { type: contextType, data: contextData?.(info) }
					const body = context ? await consumeBodyOptional(reader, ...[context.type, context.data] as ["generic", undefined]) : []
					info.body = body
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					const result = await consumer(info as ChiriMacroInternalConsumerInfo<NameType, any, never>)

					if (!result)
						reader.restorePosition(savedPosition)

					return result
				},
			}

			return macro
		},
	}
}
