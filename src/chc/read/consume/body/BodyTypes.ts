const BodyTypes = [
	"generic" as const,
	"shorthand" as const,
	"paths" as const,
	"text" as const,
]

export default BodyTypes

export type BodyType = (typeof BodyTypes)[number]
