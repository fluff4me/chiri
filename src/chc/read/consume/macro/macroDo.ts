import type { ChiriPosition, ChiriStatement } from "../../ChiriReader"
import consumeBody from "../consumeBody"
import MacroConstruct from "./MacroConstruct"

export interface ChiriDo {
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
			content: body.content,
			position,
		}
	})
