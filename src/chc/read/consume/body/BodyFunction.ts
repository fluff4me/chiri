import type ChiriReader from "../../ChiriReader"

type BodyFunction<T, ARGS extends any[]> = (reader: ChiriReader, ...args: ARGS) => T | undefined

function BodyFunction<T, ARGS extends any[]> (consumer: BodyFunction<T, ARGS>): BodyFunction<T, ARGS> {
	return consumer
}

export default BodyFunction
