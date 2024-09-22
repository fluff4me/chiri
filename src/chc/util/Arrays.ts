import type { ArrayOr } from "./Type"

namespace Arrays {
	export function resolve<T> (arrayOr: ArrayOr<T>): T[] {
		return Array.isArray(arrayOr) ? arrayOr : [arrayOr]
	}

	export function filterNullish<T> (value: T, index: number, array: T[]): value is Exclude<T, undefined | null> {
		return value !== null && value !== undefined
	}
}

export default Arrays
