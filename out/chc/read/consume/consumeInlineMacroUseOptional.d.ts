import type ChiriReader from "../ChiriReader";
import type { ChiriAssignment } from "./macro/macroSet";
export type MacroResultInline = ChiriAssignment;
declare const _default: (reader: ChiriReader) => Promise<MacroResultInline | undefined>;
export default _default;
