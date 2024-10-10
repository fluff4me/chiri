import type { ChiriType } from "../../../type/ChiriType";
import type { PromiseOr } from "../../../util/Type";
import type ChiriReader from "../../ChiriReader";
import type { ChiriPosition, ChiriStatement } from "../../ChiriReader";
import type { ContextStatement } from "../body/BodyRegistry";
import type { ChiriContextSpreadable, ChiriContextType, ChiriContextTypeWithData, ChiriContextTypeWithoutData, ContextData, ResolveContextDataTuple } from "../body/Contexts";
import type { ChiriWord } from "../consumeWord";
import type { ChiriWordInterpolated } from "../consumeWordInterpolatedOptional";
import type { ChiriExpressionOperand } from "../expression/consumeExpression";
export interface ChiriMacroBase {
    type: string;
    name: ChiriWord;
    content: ChiriStatement[];
    position: ChiriPosition;
}
export interface ChiriMacroInternal<T> extends ChiriMacroBase {
    type: "macro:internal";
    consumeOptional(reader: ChiriReader): Promise<T | undefined>;
    consumeOptional<CONTEXT extends ChiriContextType>(reader: ChiriReader, context: CONTEXT, ...data: ResolveContextDataTuple<CONTEXT>): Promise<T | undefined>;
    consumeOptional(reader: ChiriReader, ...context: ChiriContextSpreadable): Promise<T | undefined>;
}
export interface ChiriMacroInternalConsumerInfo<NAMED extends NameType = undefined, BODY = null, EXTRA = never> {
    reader: ChiriReader;
    assignments: Record<string, ChiriExpressionOperand>;
    body: (BODY extends null ? never : BODY)[];
    name: NAMED extends "plain" ? ChiriWord : NAMED extends "interpolated" ? ChiriWordInterpolated : undefined;
    extra: EXTRA;
    position: ChiriPosition;
    start: number;
}
type NameType = "plain" | "interpolated" | undefined;
export type ChiriMacroInternalBodyContextSupplierInfo<NAMED extends NameType = undefined, EXTRA = never> = Omit<ChiriMacroInternalConsumerInfo<NAMED, null, EXTRA>, "body">;
export type ChiriMacroInternalParametersConsumer<T> = (reader: ChiriReader) => PromiseOr<T>;
export interface ChiriMacroInternalFactory<NAMED extends NameType = undefined, BODY = null, EXTRA = never> {
    usability(...types: ChiriContextType[]): this;
    /**
     * Note: This does not consume white space for you, in case the parameters are optional
     */
    consumeParameters<T>(consumer: ChiriMacroInternalParametersConsumer<T>): ChiriMacroInternalFactory<NAMED, BODY, T>;
    named(): ChiriMacroInternalFactory<"plain", BODY>;
    named(allowInterpolations: true): ChiriMacroInternalFactory<"interpolated", BODY>;
    /** Require a parameter */
    parameter(name: string, type: ChiriType): this;
    /** Add an optional parameter */
    parameter(name: string, type: ChiriType, value: ChiriExpressionOperand | undefined): this;
    body<CONTEXT extends ChiriContextTypeWithoutData>(context: CONTEXT): ChiriMacroInternalFactory<NAMED, ContextStatement<CONTEXT>, EXTRA>;
    body<CONTEXT extends ChiriContextTypeWithData>(context: CONTEXT, data: (info: ChiriMacroInternalBodyContextSupplierInfo<NAMED, EXTRA>) => ContextData[CONTEXT]): ChiriMacroInternalFactory<NAMED, ContextStatement<CONTEXT>, EXTRA>;
    consume<T>(consumer: (info: ChiriMacroInternalConsumerInfo<NAMED, BODY, EXTRA>) => T | undefined | Promise<T | undefined>): ChiriMacroInternal<T>;
}
export default function (macroName: string): ChiriMacroInternalFactory;
export {};
