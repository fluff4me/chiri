import type ChiriReader from "../ChiriReader";
import type { ContextStatement } from "./body/BodyRegistry";
import type { ChiriContextTypeWithData, ChiriContextTypeWithoutData, ContextData } from "./body/Contexts";
export default function <CONTEXT extends ChiriContextTypeWithoutData>(reader: ChiriReader, context: CONTEXT, initialiser?: (sub: ChiriReader) => any): Promise<ContextStatement<CONTEXT>[] | undefined>;
export default function <CONTEXT extends ChiriContextTypeWithData>(reader: ChiriReader, context: CONTEXT, data: ContextData[CONTEXT], initialiser?: (sub: ChiriReader) => any): Promise<ContextStatement<CONTEXT>[] | undefined>;
