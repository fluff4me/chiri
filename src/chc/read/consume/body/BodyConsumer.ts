import type { PromiseOr } from "../../../util/Type"
import type ChiriReader from "../../ChiriReader"
import type { ChiriBodyConsumer } from "../../ChiriReader"
import type { ChiriContextType } from "./Contexts"

interface BodyConsumer<T, ARGS extends any[]> {
	context: ChiriContextType
	(reader: ChiriReader, ...args: ARGS): PromiseOr<T | undefined>
}

function BodyConsumer<T, ARGS extends any[]> (context: ChiriContextType, consumer: (reader: ChiriReader, ...args: ARGS) => T | undefined): BodyConsumer.Sync<T, ARGS>
function BodyConsumer<T, ARGS extends any[]> (context: ChiriContextType, consumer: (reader: ChiriReader, ...args: ARGS) => PromiseOr<T | undefined>): BodyConsumer<T, ARGS>
function BodyConsumer<T, ARGS extends any[]> (context: ChiriContextType, consumer: (reader: ChiriReader, ...args: ARGS) => PromiseOr<T | undefined>): BodyConsumer<T, ARGS> {
	return Object.assign(consumer, { context })
}

namespace BodyConsumer {
	export interface Sync<T, ARGS extends any[]> {
		context: ChiriContextType
		(reader: ChiriReader, ...args: ARGS): T | undefined
	}

	export function is<T> (consumer?: ChiriBodyConsumer<T>): consumer is BodyConsumer<T, []> {
		return !!consumer && "context" in consumer
	}
}

export default BodyConsumer
