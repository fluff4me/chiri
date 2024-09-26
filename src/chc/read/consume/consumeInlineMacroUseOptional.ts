import type ChiriReader from "../ChiriReader"
import type { ChiriAssignment } from "./macro/macroSet"
import { consumeAssignmentOptional } from "./macro/macroSet"

export type MacroResultInline =
	| ChiriAssignment

export default async (reader: ChiriReader): Promise<MacroResultInline | undefined> => {
	return undefined
		?? await consumeAssignmentOptional(reader, true)
}
