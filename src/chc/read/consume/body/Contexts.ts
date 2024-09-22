const Contexts = [
	"inherit" as const,
	"root" as const,
	"generic" as const,
	"function" as const,
	"shorthand" as const,
	"paths" as const,
	"text" as const,
	"mixin" as const,
	"rule" as const,
]

export default Contexts

export type ChiriContext = (typeof Contexts)[number]
