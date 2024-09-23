

import type ChiriReader from "../ChiriReader"
import type { ChiriPosition } from "../ChiriReader"
import consumeNewBlockLineOptional from "./consumeNewBlockLineOptional"

export interface ChiriDocumentation {
	type: "documentation"
	content: string
	position: ChiriPosition
}

export default (reader: ChiriReader): ChiriDocumentation | undefined => {
	const position = reader.getPosition()
	if (!reader.consumeOptional(";; "))
		return undefined

	let documentation = ""
	while (true) {
		if (documentation && !reader.consumeOptional("  "))
			documentation += "\n"

		for (; reader.i < reader.input.length; reader.i++) {
			if (reader.input[reader.i] === "\n") {
				documentation += "\n"
				break
			} else if (reader.input[reader.i] !== "\r")
				documentation += reader.input[reader.i]
		}

		const beforeConsumeNewline = reader.savePosition()
		if (!consumeNewBlockLineOptional(reader))
			throw reader.error("Expected additional documentation or documented declaration")

		if (!reader.consumeOptional(";; ")) {
			reader.restorePosition(beforeConsumeNewline)
			return {
				type: "documentation",
				content: documentation.slice(0, -1),
				position,
			}
		}
	}
}
