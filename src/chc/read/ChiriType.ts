import { INTERNAL_POSITION } from "../../constants"
import type { ChiriWord } from "../ChiriAST"

export interface ChiriType {
	type: "type"
	name: ChiriWord
	generics: ChiriType[]
}

export namespace ChiriType {
	export function of (name: string, ...generics: (string | ChiriType)[]): ChiriType {
		return {
			type: "type",
			name: { type: "word", value: name, position: INTERNAL_POSITION },
			generics: generics.map(generic => typeof generic === "string" ? of(generic) : generic),
		}
	}

	export function stringify (type: ChiriType, stack = false): string {
		const stringified = `${type.name.value}${type.generics.map(generic => `!${stringify(generic, true)}`).join("")}`
		return stack && type.generics.length ? `(${stringified})` : stringified
	}
}
