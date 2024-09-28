import type ChiriReader from "../ChiriReader";
import type { ChiriStatement } from "../ChiriReader";
import type { ContextStatement } from "./body/BodyRegistry";
import type { ChiriContextTypeWithData, ChiriContextTypeWithoutData, ContextData } from "./body/Contexts";
export interface ChiriBody<STATEMENT = ChiriStatement> {
    content: STATEMENT[];
}
declare function consumeBody<CONTEXT extends ChiriContextTypeWithoutData>(reader: ChiriReader, context: CONTEXT, initialiser?: (sub: ChiriReader) => any, singleLineOnly?: true): Promise<ChiriBody<ContextStatement<CONTEXT>>>;
declare function consumeBody<CONTEXT extends ChiriContextTypeWithData>(reader: ChiriReader, context: CONTEXT, data: ContextData[CONTEXT], initialiser?: (sub: ChiriReader) => any, singleLineOnly?: true): Promise<ChiriBody<ContextStatement<CONTEXT>>>;
export default consumeBody;
