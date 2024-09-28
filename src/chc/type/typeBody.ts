import Contexts from "../read/consume/body/Contexts"
import { ChiriType } from "./ChiriType"
import TypeDefinition from "./TypeDefinition"

export default TypeDefinition({
	type: ChiriType.of("body"),
	generics: [Contexts],
})
