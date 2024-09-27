import { ChiriType } from "../ChiriType"
import Contexts from "../consume/body/Contexts"
import TypeDefinition from "./TypeDefinition"

export default TypeDefinition({
	type: ChiriType.of("body"),
	generics: [Contexts],
})
