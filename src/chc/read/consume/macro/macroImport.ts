import type { ChiriPath } from "../consumePathOptional"
import MacroConstruct from "./MacroConstruct"

export interface ChiriImport {
	type: "import"
	paths: ChiriPath[]
}

export default MacroConstruct("import")
	.body("paths")
	.consume(({ reader, assignments, body }): ChiriImport | undefined => {
		if (!body)
			throw reader.error("Expected paths to import")

		return {
			type: "import",
			paths: body,
		}
	})
