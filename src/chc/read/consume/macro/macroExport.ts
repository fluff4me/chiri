import { LITERAL_FALSE } from "../../../../constants"
import { ChiriType } from "../../ChiriType"
import isLiteral from "../../guard/isLiteral"
import MacroFunction from "./MacroFunction"

export default MacroFunction("export")
	.parameter("once", ChiriType.of("bool"), LITERAL_FALSE)
	.parameter("in", ChiriType.of("string"))
	.consume(({ reader, assignments }) => {
		if (reader.hasStatements())
			throw reader.error("#export must be the first statement in a file")

		if (assignments.once) {
			if (!isLiteral(assignments.once))
				throw reader.error("\"once\" parameter of #export must be a literal boolean")

			reader.setOnce()
		}

		const context = assignments.in
		if (!isLiteral(context, "string") || context.segments.length !== 1 || typeof context.segments[0] !== "string")
			throw reader.error("\"in\" parameter of #export must be a literal, raw string")

		if (reader.context !== context.segments[0])
			throw reader.error(`${reader.basename} is exported for use in "${context.segments[0]}" context, but was imported into a "${reader.context}" context`)

		return true
	})
