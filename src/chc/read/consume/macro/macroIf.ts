import { ChiriType } from "../../../type/ChiriType"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import consumeWhiteSpace from "../consumeWhiteSpace"
import type { ChiriExpressionOperand } from "../expression/consumeExpression"
import consumeExpression from "../expression/consumeExpression"
import type { ChiriMacroBlock } from "./MacroConstruct"
import MacroConstruct from "./MacroConstruct"

export interface ChiriIf extends ChiriMacroBlock {
	type: "if" | "elseif"
	condition: ChiriExpressionOperand
	content: ChiriStatement[]
	position: ChiriPosition
}

export interface ChiriElse extends ChiriMacroBlock {
	type: "else"
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("if")
	.consumeParameters(reader => consumeWhiteSpace(reader) && consumeExpression.inline(reader, ChiriType.of("bool")))
	.body("inherit")
	.consume(({ extra: condition, body: content, position }): ChiriIf => {
		return {
			type: "if",
			isBlock: true,
			condition,
			content,
			position,
		}
	})

export const macroIfElse = MacroConstruct("else if")
	.consumeParameters(reader => consumeWhiteSpace(reader) && consumeExpression.inline(reader, ChiriType.of("bool")))
	.body("inherit")
	.consume(({ reader, extra: condition, body: content, position, start }): ChiriIf => {
		verifyFollowingIf(reader, start, "else if")
		return {
			type: "elseif",
			isBlock: true,
			condition,
			content,
			position,
		}
	})

export const macroElse = MacroConstruct("else")
	.body("inherit")
	.consume(({ reader, extra: condition, body: content, position, start }): ChiriElse => {
		verifyFollowingIf(reader, start, "else")
		return {
			type: "else",
			isBlock: true,
			content,
			position,
		}
	})

function verifyFollowingIf (reader: ChiriReader, start: number, constructName: string) {
	const previousStatementType = reader.getStatements(true).at(-1)?.type
	if (previousStatementType !== "if" && previousStatementType !== "elseif") {
		reader.i = start + constructName.length + 1
		throw reader.error(start, `#${constructName} macros must directly follow an #if or #else if macro`)
	}
}
