import type { ChiriPath } from "../consumePathOptional"
import MacroFunction from "./MacroFunction"

export interface ChiriImport {
	type: "import"
	paths: ChiriPath[]
}

export default MacroFunction("import")
	.body("paths")
	.consume(({ reader, assignments, body }): ChiriImport | undefined => ({
		type: "import",
		paths: body,
	}))
