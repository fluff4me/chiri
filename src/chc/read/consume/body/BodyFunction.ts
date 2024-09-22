import type { PromiseOr } from "../../../util/Type"
import type ChiriReader from "../../ChiriReader"
import type { ChiriBodyConsumer } from "../../ChiriReader"
import type { ChiriContext } from "./Contexts"

interface BodyFunction<T, ARGS extends any[]> {
	context: ChiriContext
	(reader: ChiriReader, ...args: ARGS): PromiseOr<T | undefined>
}

function BodyFunction<T, ARGS extends any[]> (context: ChiriContext, consumer: (reader: ChiriReader, ...args: ARGS) => T | undefined): BodyFunction.Sync<T, ARGS>
function BodyFunction<T, ARGS extends any[]> (context: ChiriContext, consumer: (reader: ChiriReader, ...args: ARGS) => PromiseOr<T | undefined>): BodyFunction<T, ARGS>
function BodyFunction<T, ARGS extends any[]> (context: ChiriContext, consumer: (reader: ChiriReader, ...args: ARGS) => PromiseOr<T | undefined>): BodyFunction<T, ARGS> {
	return Object.assign(consumer, { context })
}

namespace BodyFunction {
	export interface Sync<T, ARGS extends any[]> {
		context: ChiriContext
		(reader: ChiriReader, ...args: ARGS): T | undefined
	}

	export function is<T> (consumer?: ChiriBodyConsumer<T>): consumer is BodyFunction<T, []> {
		return !!consumer && "context" in consumer
	}
}

export default BodyFunction
