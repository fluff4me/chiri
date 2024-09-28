

import type { ChiriType, ChiriTypeGeneric } from "../../../type/ChiriType"
import { consumeType, consumeTypeOptional } from "../consumeType"
import consumeWhiteSpace from "../consumeWhiteSpace"
import type { ChiriMacroBase } from "./MacroConstruct"
import MacroConstruct from "./MacroConstruct"

export interface ChiriFunction extends ChiriMacroBase {
	type: "function"
	generics: ChiriTypeGeneric[]
	returnType: ChiriType
}

export default MacroConstruct("function")
	.named()
	.consumeParameters(reader => {
		consumeWhiteSpace(reader)

		const generics: ChiriTypeGeneric[] = []
		if (reader.consumeOptional("with")) {
			consumeWhiteSpace(reader)

			while (true) {
				if (reader.peek("returns"))
					break

				const type = consumeTypeOptional(reader, true)
				if (!type)
					break

				if (!type.generics.length)
					throw reader.error("Function type declarations must be generic")

				generics.push(type)

				consumeWhiteSpace(reader)
			}

			if (!generics.length)
				throw reader.error("Expected at least one type declaration")
		}

		reader.consume("returns")
		consumeWhiteSpace(reader)

		const returnType = reader.types.with(...generics)
			.do(() => consumeType(reader))

		return { generics, returnType }
	})
	.body("function", ({ extra: { generics: types } }) => ({ types }))
	.consume(({ body, name, position, extra: { generics, returnType } }): ChiriFunction | undefined => ({
		type: "function",
		name,
		content: body,
		position,
		generics,
		returnType,
	}))
