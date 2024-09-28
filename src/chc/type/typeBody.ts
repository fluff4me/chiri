import type { ChiriContextType } from "../read/consume/body/Contexts"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export const BodyVariableContexts = [
	"text",
	"property-name",
	"component",
] satisfies ChiriContextType[]

export type BodyVariableContext = (typeof BodyVariableContexts)[number]

export default TypeDefinition({
	type: ChiriType.of("body"),
	generics: [
		BodyVariableContexts,
	],
})
