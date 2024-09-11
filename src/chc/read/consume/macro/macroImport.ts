import type { ChiriImport } from "../../../ChiriAST"
import consumePathOptional from "../consumePathOptional"
import MacroFunction from "./MacroFunctionInternal"

export default MacroFunction("import")
	.body(reader => {
		const path = consumePathOptional(reader)
		if (!path)
			throw reader.error(reader.consumeOptional("./") ? "Remove the ./ from the start of this path"
				: "Expected path to import")

		return path
	})
	.consume(({ reader, assignments, body }): ChiriImport | undefined => ({
		type: "import",
		paths: body,
	}))
