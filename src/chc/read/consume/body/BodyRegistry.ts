import type { ChiriStatement } from "../../ChiriReader"
import type BodyFunction from "./BodyFunction"
import bodyPaths from "./bodyPaths"
import bodyShorthand from "./bodyShorthand"
import bodyText from "./bodyText"
import type { ChiriContext } from "./Contexts"

const BodyRegistry = {
	function: undefined,
	inherit: undefined,
	generic: undefined,
	root: undefined,
	mixin: undefined,
	component: undefined,
	state: undefined,
	shorthand: bodyShorthand,
	paths: bodyPaths,
	text: bodyText,
} satisfies Record<ChiriContext, BodyFunction<any, []> | undefined>

export default BodyRegistry

export type ContextStatement<CONTEXT extends ChiriContext> = (typeof BodyRegistry)[CONTEXT] extends BodyFunction<infer T, []> ? T : ChiriStatement
