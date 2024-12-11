import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import consumeBody from "../consumeBody"
import type { ChiriMacroBlock } from "./MacroConstruct"
import MacroConstruct from "./MacroConstruct"

export interface ChiriDo extends ChiriMacroBlock {
	type: "do"
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroConstruct("do")
	.consume(async ({ reader, position }): Promise<ChiriDo> => {
		reader.consume(":")
		const body = await consumeBody(reader, "inherit")
		return {
			type: "do",
			isBlock: true,
			content: body.content,
			position,
		}
	})
