import type { ChiriText } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import consumeWordInterpolatedOptional from "./consumeWordInterpolatedOptional"

export default (reader: ChiriReader): ChiriText => {
	if (!reader.isLetter() && !reader.peek("#"))
		throw reader.error("Words must start with a letter")

	return consumeWordInterpolatedOptional(reader)!
}
