import type ChiriReader from "../ChiriReader"
import type { ContextStatement } from "./body/BodyRegistry"
import type { ChiriContext } from "./body/Contexts"
import consumeBody from "./consumeBody"

export default async function <CONTEXT extends ChiriContext> (reader: ChiriReader, context: CONTEXT, initialiser?: (sub: ChiriReader) => any): Promise<ContextStatement<CONTEXT>[] | undefined>
export default async function (reader: ChiriReader, context: ChiriContext, initialiser?: (sub: ChiriReader) => any): Promise<ContextStatement<ChiriContext>[] | undefined> {
	if (!reader.consumeOptional(":"))
		return undefined

	const body = await consumeBody(reader, context)
	return body.content as any[]
}
