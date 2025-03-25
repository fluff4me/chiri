import { ChiriType } from "../../../type/ChiriType"
import typeInt from "../../../type/typeInt"
import type ChiriReader from "../../ChiriReader"
import type { ChiriPosition } from "../../ChiriReader"
import type consumeExpressionType from "./consumeExpression"
import type { ChiriExpressionOperand } from "./consumeExpression"

export interface ChiriLiteralRange {
	type: "literal"
	subType: "range"
	valueType: ChiriType
	start?: ChiriExpressionOperand
	end?: ChiriExpressionOperand
	inclusive?: true
	position: ChiriPosition
}

let checkingForRange = false
let consumeExpression: typeof consumeExpressionType
export default Object.assign(
	function (reader: ChiriReader, listSlice?: true, start?: ChiriExpressionOperand): ChiriLiteralRange | undefined {
		if (checkingForRange)
			return undefined

		checkingForRange = true
		const restore = reader.savePosition()
		const position = reader.getPosition()
		start ??= consumeExpression.inlineOptional(reader, typeInt.type)
		const operator = reader.consumeOptional("...", "..")
		const end = operator && consumeExpression.inlineOptional(reader, typeInt.type)
		checkingForRange = false
		if (!operator || (!end && !listSlice)) {
			reader.restorePosition(restore)
			return undefined
		}

		return {
			type: "literal",
			subType: "range",
			start,
			end,
			inclusive: operator === "..." ? true : undefined,
			valueType: ChiriType.of("list", "int"),
			position,
		}
	},
	{
		setConsumeExpression (ExpressionIn: typeof consumeExpressionType) {
			consumeExpression = ExpressionIn
		},
		setCheckingForRange (checkingForRangeIn: boolean) {
			checkingForRange = checkingForRangeIn
		},
	}
)
