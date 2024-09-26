import type ChiriReader from "../ChiriReader"
import type { ChiriStatement } from "../ChiriReader"
import assertNotWhiteSpaceAndNewLine from "../assert/assertNotWhiteSpaceAndNewLine"
import type BodyConsumer from "./body/BodyConsumer"
import type { ContextStatement } from "./body/BodyRegistry"
import BodyRegistry from "./body/BodyRegistry"
import type { ChiriContextType, ChiriContextTypeWithData, ChiriContextTypeWithoutData, ContextData } from "./body/Contexts"
import consumeBlockStartOptional from "./consumeBlockStartOptional"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"

export interface ChiriBody<STATEMENT = ChiriStatement> {
	content: STATEMENT[]
}

async function consumeBody<CONTEXT extends ChiriContextTypeWithoutData> (reader: ChiriReader, context: CONTEXT, initialiser?: (sub: ChiriReader) => any, singleLineOnly?: true): Promise<ChiriBody<ContextStatement<CONTEXT>>>
async function consumeBody<CONTEXT extends ChiriContextTypeWithData> (reader: ChiriReader, context: CONTEXT, data: ContextData[CONTEXT], initialiser?: (sub: ChiriReader) => any, singleLineOnly?: true): Promise<ChiriBody<ContextStatement<CONTEXT>>>
async function consumeBody (reader: ChiriReader, type: ChiriContextType, initialiserOrData?: ContextData[ChiriContextType] | ((sub: ChiriReader) => any), initialiserOrSingleLineOnly?: true | ((sub: ChiriReader) => any), singleLineOnly?: true): Promise<ChiriBody<ContextStatement<ChiriContextType>>> {
	const data = typeof initialiserOrData === "function" ? undefined : initialiserOrData
	const initialiser = typeof initialiserOrData === "function" ? initialiserOrData : initialiserOrSingleLineOnly as (sub: ChiriReader) => any
	singleLineOnly ||= initialiserOrSingleLineOnly === true ? true : undefined

	const context = type === "inherit" ? reader.context : { type, data }

	assertNotWhiteSpaceAndNewLine(reader)

	const multiline = !singleLineOnly && consumeBlockStartOptional(reader)
	const whitespace = multiline || consumeWhiteSpaceOptional(reader)
	if (!whitespace)
		return {
			content: [],
		}

	if (reader.peek("\r\n", "\n"))
		throw reader.error(reader.i - reader.getColumnNumber(), "Unexpected indentation on empty line")

	const sub = reader.sub(multiline, context.type, context.data)
	initialiser?.(sub)

	const consumer = BodyRegistry[context.type]
	const ast = await sub.read(consumer as BodyConsumer<any, []>)
	if (sub.errored)
		throw reader.subError()

	const content = ast.statements as ChiriStatement[]
	reader.update(sub)
	return {
		content,
	}
}

export default consumeBody
