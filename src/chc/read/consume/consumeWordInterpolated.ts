import type ChiriReader from "../ChiriReader"
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional"
import consumeWordInterpolatedOptional from "./consumeWordInterpolatedOptional"

export default (reader: ChiriReader, skipStartRequirements = false): ChiriWordInterpolated => {
	if (!reader.isLetter() && !reader.peek("#") && (!skipStartRequirements || (!reader.peek("-") && !reader.isDigit())))
		throw reader.error("Words must start with a letter")

	return consumeWordInterpolatedOptional(reader, skipStartRequirements)!
}
