import type { ArrayOr } from "./Type"

namespace Arrays {
	export function resolve<T> (arrayOr: ArrayOr<T>): T[] {
		return Array.isArray(arrayOr) ? arrayOr : [arrayOr]
	}

	export function filterNullish<T> (value: T, index: number, array: T[]): value is Exclude<T, undefined | null> {
		return value !== null && value !== undefined
	}

	export function insertBefore<T> (array: T[], value: T, referenceValue: T): T[] {
		const index = array.indexOf(referenceValue)
		if (index === -1)
			array.push(value)
		else
			array.splice(index, 0, value)
		return array
	}

	export function assert<VALUE, IS extends VALUE> (error: (value: VALUE) => Error, guard: (value: VALUE, index: number, array: VALUE[]) => value is IS): (value: VALUE, index: number, array: VALUE[]) => value is IS {
		return (value, index, array): value is IS => {
			const is = guard(value, index, array)
			if (!is)
				throw error(value)

			return true
		}
	}
}

export default Arrays
