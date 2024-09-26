import type ChiriReader from "../ChiriReader"
import type { ContextStatement } from "./body/BodyRegistry"
import type { ChiriContextType, ChiriContextTypeWithData, ChiriContextTypeWithoutData, ContextData } from "./body/Contexts"
import consumeBody from "./consumeBody"

export default async function <CONTEXT extends ChiriContextTypeWithoutData> (reader: ChiriReader, context: CONTEXT, initialiser?: (sub: ChiriReader) => any): Promise<ContextStatement<CONTEXT>[] | undefined>
export default async function <CONTEXT extends ChiriContextTypeWithData> (reader: ChiriReader, context: CONTEXT, data: ContextData[CONTEXT], initialiser?: (sub: ChiriReader) => any): Promise<ContextStatement<CONTEXT>[] | undefined>
export default async function (reader: ChiriReader, ...args: any[]): Promise<ContextStatement<ChiriContextType>[] | undefined> {
	if (!reader.consumeOptional(":"))
		return undefined

	const body = await consumeBody(reader, ...args as ["generic", (sub: ChiriReader) => any])
	return body.content as any[]
}
