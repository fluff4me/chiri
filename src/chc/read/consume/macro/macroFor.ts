import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import consumeBody from "../consumeBody"
import type { ChiriCompilerVariable } from "../consumeCompilerVariableOptional"
import consumeCompilerVariableOptional from "../consumeCompilerVariableOptional"
import consumeInlineMacroUseOptional from "../consumeInlineMacroUseOptional"
import consumeWhiteSpace from "../consumeWhiteSpace"
import consumeWhiteSpaceOptional from "../consumeWhiteSpaceOptional"
import type { ChiriExpressionOperand } from "../expression/consumeExpression"
import consumeExpression from "../expression/consumeExpression"
import MacroConstruct from "./MacroConstruct"

export interface ChiriFor {
	type: "for"
	variable: ChiriCompilerVariable
	condition: ChiriExpressionOperand
	update?: ChiriStatement
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("for")
	.consumeParameters(async reader => {
		consumeWhiteSpace(reader)

		const variable = await consumeCompilerVariableOptional(reader, false)
		if (!variable)
			throw reader.error("Expected variable declaration")

		reader.consume(",")
		consumeWhiteSpaceOptional(reader)

		const [condition, update] = await reader
			.with(variable)
			.do(async () => {
				const condition = consumeExpression.inline(reader)

				reader.consume(",")
				consumeWhiteSpaceOptional(reader)

				const update = await consumeInlineMacroUseOptional(reader)
				return [condition, update]
			})

		return {
			variable,
			condition,
			update,
		}
	})
	.consume(async ({ reader, extra: { variable, condition, update }, position }): Promise<ChiriFor> => {
		reader.consume(":")
		const body = await consumeBody(reader, "inherit", sub => sub.addOuterStatement(variable))
		return {
			type: "for",
			variable,
			condition,
			update,
			...body,
			position,
		}
	})
