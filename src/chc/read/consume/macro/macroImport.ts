import type { ChiriImport } from "../../../ChiriAST"
import bodyPaths from "../body/bodyPaths"
import MacroFunction from "./MacroFunction"

export default MacroFunction("import")
	.body(bodyPaths)
	.consume(({ reader, assignments, body }): ChiriImport | undefined => ({
		type: "import",
		paths: body,
	}))
