import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import consumeBody from "../consumeBody"
import MacroFunction from "./MacroFunction"

export interface ChiriDo {
	type: "do"
	content: ChiriStatement[]
	position: ChiriPosition
}

export default MacroFunction("do")
	.consume(async ({ reader, position }): Promise<ChiriDo> => {
		reader.consume(":")
		const body = await consumeBody(reader, "inherit")
		return {
			type: "do",
			content: body.content,
			position,
		}
	})
