import type ChiriReader from "../ChiriReader"
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional"
import consumeWordInterpolatedOptional from "./consumeWordInterpolatedOptional"

export default (reader: ChiriReader, allowDashStart = false): ChiriWordInterpolated => {
	if (!reader.isLetter() && !reader.peek("#") && (!allowDashStart || !reader.peek("-")))
		throw reader.error("Words must start with a letter")

	return consumeWordInterpolatedOptional(reader, allowDashStart)!
}
