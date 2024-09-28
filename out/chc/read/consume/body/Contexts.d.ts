import type { ChiriTypeGeneric } from "../../../type/ChiriType";
declare const Contexts: ("function" | "inherit" | "root" | "generic" | "paths" | "text" | "mixin" | "component" | "state" | "property-name")[];
export default Contexts;
export type ChiriContextType = (typeof Contexts)[number];
export interface ChiriFunctionBodyContext {
    types: ChiriTypeGeneric[];
}
export interface ContextData {
    function: ChiriFunctionBodyContext;
    inherit?: undefined;
    generic?: undefined;
    root?: undefined;
    mixin?: undefined;
    component?: undefined;
    state?: undefined;
    "property-name"?: undefined;
    paths?: undefined;
    text?: undefined;
}
export type ChiriContextTypeWithoutData = {
    [CONTEXT in ChiriContextType as ContextData[CONTEXT] extends undefined ? CONTEXT : never]: CONTEXT;
} extends infer O ? O[keyof O] : never;
export type ChiriContextTypeWithData = {
    [CONTEXT in ChiriContextType as ContextData[CONTEXT] extends undefined ? never : CONTEXT]: CONTEXT;
} extends infer O ? O[keyof O] : never;
export type ResolveContext<CONTEXT extends ChiriContextType> = ContextData[CONTEXT] extends undefined ? {
    type: CONTEXT;
    data?: undefined;
} : {
    type: CONTEXT;
    data: ContextData[CONTEXT];
};
export type ChiriContext = {
    [CONTEXT in ChiriContextType]: ResolveContext<CONTEXT>;
}[ChiriContextType];
export type ChiriContextSpreadable = {
    [CONTEXT in ChiriContextType]: ContextData[CONTEXT] extends undefined ? [CONTEXT, undefined?] : [CONTEXT, ContextData[CONTEXT]];
}[ChiriContextType];
export type ResolveContextDataTuple<CONTEXT extends ChiriContextType> = ContextData[CONTEXT] extends undefined ? [data?: undefined] : [data: ContextData[CONTEXT]];