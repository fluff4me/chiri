import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriPath } from "../consumePathOptional"
import type { ChiriValueText } from "../consumeValueText"
import MacroConstruct from "./MacroConstruct"

export interface ChiriImport {
	type: "import"
	paths: ChiriPath[]
}

export default MacroConstruct("import")
	.body("paths")
	.consume(({ reader, assignments, body, extra }): ChiriImport | undefined => {
		if (!body)
			throw reader.error("Expected paths to import")

		return {
			type: "import",
			paths: body,
		}
	})

export interface ChiriCSSImport {
	type: "import-css"
	imports: ChiriValueText[]
	position: ChiriPosition
}

export const macroImportCSS = MacroConstruct("import css")
	.body("text")
	.consume(({ body, position }): ChiriCSSImport => ({
		type: "import-css",
		imports: body,
		position,
	}))
