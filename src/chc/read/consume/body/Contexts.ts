import type { ChiriTypeGeneric } from "../../../type/ChiriType"

const Contexts = [
	"inherit" as const,
	"root" as const,
	"generic" as const,
	"function" as const,
	"paths" as const,
	"text" as const,
	"mixin" as const,
	"component" as const,
	"state" as const,
	"pseudo" as const,
	"property-name" as const,
	"keyframes" as const,
	"keyframe" as const,
	"selectors" as const,
]

export default Contexts

export type ChiriContextType = (typeof Contexts)[number]

export interface ChiriFunctionBodyContext {
	types: ChiriTypeGeneric[]
}

export interface ContextData {
	function: ChiriFunctionBodyContext
	inherit?: undefined
	generic?: undefined
	root?: undefined
	mixin?: undefined
	component?: undefined
	state?: undefined
	pseudo?: undefined
	"property-name"?: undefined
	paths?: undefined
	text?: undefined
	keyframes?: undefined
	keyframe?: undefined
	selectors?: undefined
}

type VerifyContexts = ContextData[ChiriContextType]

export type ChiriContextTypeWithoutData = { [CONTEXT in ChiriContextType as ContextData[CONTEXT] extends undefined ? CONTEXT : never]: CONTEXT } extends infer O ? O[keyof O] : never
export type ChiriContextTypeWithData = { [CONTEXT in ChiriContextType as ContextData[CONTEXT] extends undefined ? never : CONTEXT]: CONTEXT } extends infer O ? O[keyof O] : never

export type ResolveContext<CONTEXT extends ChiriContextType> =
	ContextData[CONTEXT] extends undefined ? { type: CONTEXT, data?: undefined } : { type: CONTEXT, data: ContextData[CONTEXT] }

export type ChiriContext = { [CONTEXT in ChiriContextType]: ResolveContext<CONTEXT> }[ChiriContextType]

export type ChiriContextSpreadable = { [CONTEXT in ChiriContextType]: ContextData[CONTEXT] extends undefined ? [CONTEXT, undefined?] : [CONTEXT, ContextData[CONTEXT]] }[ChiriContextType]
export type ResolveContextDataTuple<CONTEXT extends ChiriContextType> =
	ContextData[CONTEXT] extends undefined ? [data?: undefined] : [data: ContextData[CONTEXT]]
