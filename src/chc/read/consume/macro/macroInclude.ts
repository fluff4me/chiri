import type { ChiriPosition } from "../../ChiriReader"
import consumeWhiteSpace from "../consumeWhiteSpace"
import type { ChiriWord } from "../consumeWord"
import consumeWord from "../consumeWord"
import MacroConstruct from "./MacroConstruct"

export interface ChiriInclude {
	type: "include"
	name: ChiriWord
	position: ChiriPosition
}

export default MacroConstruct("include")
	.consumeParameters(reader => consumeWhiteSpace(reader) && { e: reader.i, word: consumeWord(reader) })
	.consume(({ reader, extra: { e, word }, position }): ChiriInclude => {
		if (reader.getVariable(word.value).valueType.name.value !== "body")
			throw reader.error(e, "#include requires variable of type \"body\"")
		return {
			type: "include",
			name: word,
			position,
		}
	})
