import type { ChiriPosition } from "../../ChiriReader"
import type { ChiriPath } from "../consumePathOptional"
import type { ChiriValueText } from "../consumeValueText"
import MacroConstruct from "./MacroConstruct"

export interface ChiriImport {
	type: "import"
	paths: ChiriPath[]
	position: ChiriPosition
}

export default MacroConstruct("import")
	.body("paths")
	.consume(({ reader, body, position }): ChiriImport | undefined => {
		if (!body)
			throw reader.error("Expected paths to import")

		return {
			type: "import",
			paths: body,
			position,
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
