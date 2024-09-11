import type { ChiriFunctionUse } from "../../../ChiriAST"
import { ChiriType } from "../../ChiriType"
import consumeValue from "../consumeValue"
import MacroFunction from "./MacroFunctionInternal"

export default MacroFunction("debug")
	.body(reader => consumeValue(reader, false))
	.consume(({ reader, assignments, body }): ChiriFunctionUse => ({
		type: "function-use",
		name: { type: "word", value: "debug", position: { file: "internal", line: 0, column: 0 } },
		variables: { content: { type: "literal", subType: "list", valueType: ChiriType.of("*"), value: body } },
		content: [],
	}))
