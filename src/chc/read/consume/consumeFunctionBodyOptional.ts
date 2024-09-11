import type { ChiriStatement } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import consumeBlockStartOptional from "./consumeBlockStartOptional"
import consumeBody from "./consumeBody"
import consumeNewBlockLineOptional from "./consumeNewBlockLineOptional"
import consumeWhiteSpaceOptional from "./consumeWhiteSpaceOptional"

export type ChiriFunctionBodyConsumer<T> = (reader: ChiriReader) => T | undefined

export default async function (reader: ChiriReader): Promise<ChiriStatement[]>
export default async function <T> (reader: ChiriReader, consumer: ChiriFunctionBodyConsumer<T>): Promise<T[]>
export default async function <T> (reader: ChiriReader, consumer?: ChiriFunctionBodyConsumer<T>): Promise<T[]> {
	reader.consume(":")

	if (!consumer) {
		const body = await consumeBody(reader, "function")
		return body.content as T[]
	}

	const result: T[] = []
	const multiline = consumeBlockStartOptional(reader)
	if (!multiline) {
		consumeWhiteSpaceOptional(reader)

		const e = reader.i
		const consumed = consumer(reader)
		if (!consumed)
			throw reader.error(e, "Expected content")

		result.push(consumed)

	} else
		while (consumeNewBlockLineOptional(reader)) {
			const e = reader.i
			const consumed = consumer(reader)
			if (!consumed)
				throw reader.error(e, "Expected content")

			result.push(consumed)
		}

	return result
}
