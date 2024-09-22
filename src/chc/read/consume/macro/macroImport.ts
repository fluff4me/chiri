import type { ChiriImport } from "../../../ChiriAST"
import MacroFunction from "./MacroFunction"

export default MacroFunction("import")
	.body("paths")
	.consume(({ reader, assignments, body }): ChiriImport | undefined => ({
		type: "import",
		paths: body,
	}))
