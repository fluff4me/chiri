import type ChiriReader from "../ChiriReader";
import type { ChiriMacroUseContext, MacroResult } from "./consumeMacroUseOptional";
export default function consumeMacroBlockUseOptional(reader: ChiriReader, context: ChiriMacroUseContext): Promise<MacroResult | undefined>;
