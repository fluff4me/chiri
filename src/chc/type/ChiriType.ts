import { INTERNAL_POSITION } from "../../constants"
import type { ChiriWord } from "../read/consume/consumeWord"

export interface ChiriType<TYPE extends string = string> {
	type: "type"
	name: ChiriWord<TYPE>
	generics: ChiriType[]
	isGeneric?: true
}

export interface ChiriTypeGeneric extends ChiriType {
	isGeneric: true
}

export namespace ChiriType {
	export function of<TYPE extends string = string> (name: TYPE, ...generics: (string | ChiriType)[]): ChiriType<TYPE> {
		return {
			type: "type",
			name: { type: "word", value: name, position: INTERNAL_POSITION },
			generics: generics.map(generic => typeof generic === "string" ? of(generic) : generic),
		}
	}

	export function stringify (type?: ChiriType, stack = false): string {
		if (!type)
			return "(no type)"

		if (type.isGeneric)
			return type.generics.map(type => stringify(type, true)).join(" ")

		const stringified = `${type.name.value}${type.generics.map(generic => `!${stringify(generic, true)}`).join("")}`
		return stack && type.generics.length ? `(${stringified})` : stringified
	}
}
