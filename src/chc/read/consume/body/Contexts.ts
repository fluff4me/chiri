const Contexts = [
	"inherit" as const,
	"root" as const,
	"generic" as const,
	"function" as const,
	"shorthand" as const,
	"paths" as const,
	"text" as const,
	"mixin" as const,
	"component" as const,
	"state" as const,
]

export default Contexts

export type ChiriContext = (typeof Contexts)[number]
