import type ChiriReader from "../ChiriReader"
import type { ChiriAssignment } from "./macro/macroSet"
import { consumeAssignmentOptional } from "./macro/macroSet"

export type MacroResultInline =
	| ChiriAssignment

export default (reader: ChiriReader): MacroResultInline | undefined => {
	return undefined
		?? consumeAssignmentOptional(reader)
}
