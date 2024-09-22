import type { ChiriStatement } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"
import type { ChiriBodyConsumer } from "../ChiriReader"
import BodyFunction from "./body/BodyFunction"
import consumeBody from "./consumeBody"

export default async function (reader: ChiriReader): Promise<ChiriStatement[]>
export default async function <T> (reader: ChiriReader, consumer: ChiriBodyConsumer<T>): Promise<T[]>
export default async function <T> (reader: ChiriReader, consumer?: ChiriBodyConsumer<T>): Promise<T[]> {
	reader.consume(":")

	const context = BodyFunction.is(consumer) ? consumer.context : "function"

	const body = await consumeBody(reader, context)
	return body.content as T[]
}
