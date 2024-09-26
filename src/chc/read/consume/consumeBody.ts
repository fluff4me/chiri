import type ChiriReader from "../ChiriReader"
import type { ChiriStatement } from "../ChiriReader"
import assertNotWhiteSpaceAndNewLine from "../assert/assertNotWhiteSpaceAndNewLine"
import type BodyFunction from "./body/BodyFunction"
import type { ContextStatement } from "./body/BodyRegistry"
import BodyRegistry from "./body/BodyRegistry"
import type { ChiriContext } from "./body/Contexts"
import consumeBlockStartOptional from "./consumeBlockStartOptional"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"

export interface ChiriBody<STATEMENT = ChiriStatement> {
	content: STATEMENT[]
}

async function consumeBody<CONTEXT extends ChiriContext> (reader: ChiriReader, context: CONTEXT, initialiser?: (sub: ChiriReader) => any, singleLineOnly?: true): Promise<ChiriBody<ContextStatement<CONTEXT>>>
async function consumeBody (reader: ChiriReader, context: ChiriContext, initialiser?: (sub: ChiriReader) => any, singleLineOnly?: true): Promise<ChiriBody<ContextStatement<ChiriContext>>> {
	assertNotWhiteSpaceAndNewLine(reader)

	const multiline = !singleLineOnly && consumeBlockStartOptional(reader)
	const whitespace = multiline || consumeWhiteSpaceOptional(reader)
	if (!whitespace)
		return {
			content: [],
		}

	if (reader.peek("\r\n", "\n"))
		throw reader.error(reader.i - reader.getColumnNumber(), "Unexpected indentation on empty line")

	context = context === "inherit" ? reader.context ?? "function" : context
	const sub = reader.sub(multiline, context)
	initialiser?.(sub)

	const consumer = BodyRegistry[context]
	const ast = await sub.read(consumer as BodyFunction<any, []>)
	if (sub.errored)
		throw reader.subError()

	const content = ast.statements as ChiriStatement[]
	reader.update(sub)
	return {
		content,
	}
}

export default consumeBody
