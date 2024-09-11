import type { ChiriBody, ChiriContext } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import assertNotWhiteSpaceAndNewLine from "../assert/assertNotWhiteSpaceAndNewLine"
import consumeBlockStartOptional from "./consumeBlockStartOptional"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"

export default async (reader: ChiriReader, context: ChiriContext, initialiser?: (sub: ChiriReader) => any): Promise<ChiriBody> => {
	assertNotWhiteSpaceAndNewLine(reader)

	const multiline = consumeBlockStartOptional(reader)
	const whitespace = multiline || consumeWhiteSpaceOptional(reader)
	if (!whitespace)
		return {
			content: [],
		}

	if (reader.peek("\r\n", "\n"))
		throw reader.error(reader.i - reader.getColumnNumber(), "Unexpected indentation on empty line")

	const sub = reader.sub(multiline, context)
	initialiser?.(sub)
	const ast = await sub.read()
	if (sub.errored)
		throw reader.subError()

	const content = ast.statements
	reader.update(sub)
	return {
		content,
	}
}
