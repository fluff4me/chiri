

import type { ChiriDocumentation } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import consumeNewBlockLineOptional from "./consumeNewBlockLineOptional"

export default (reader: ChiriReader): ChiriDocumentation | undefined => {
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

		if (!consumeNewBlockLineOptional(reader))
			throw reader.error("Expected additional documentation or documented declaration")

		if (!reader.consumeOptional(";; "))
			return {
				type: "documentation",
				content: documentation.slice(0, -1),
			}
	}
}
