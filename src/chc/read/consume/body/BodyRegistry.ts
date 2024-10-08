import type { ChiriStatement } from "../../ChiriReader"
import type BodyConsumer from "./BodyConsumer"
import bodyFunction from "./bodyFunction"
import bodyKeyframes from "./bodyKeyframes"
import bodyPaths from "./bodyPaths"
import bodyPropertyName from "./bodyPropertyName"
import bodySelectors from "./bodySelectors"
import bodyText from "./bodyText"
import type { ChiriContextType } from "./Contexts"

const BodyRegistry = {
	function: bodyFunction,
	inherit: undefined,
	generic: undefined,
	root: undefined,
	mixin: undefined,
	component: undefined,
	state: undefined,
	pseudo: undefined,
	keyframe: undefined,
	"property-name": bodyPropertyName,
	paths: bodyPaths,
	text: bodyText,
	keyframes: bodyKeyframes,
	selectors: bodySelectors,
} satisfies Record<ChiriContextType, BodyConsumer<any, []> | undefined>

export default BodyRegistry

export type ContextStatement<CONTEXT extends ChiriContextType> = (typeof BodyRegistry)[CONTEXT] extends BodyConsumer<infer T, []> ? T : ChiriStatement
