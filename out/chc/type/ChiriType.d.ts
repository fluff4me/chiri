import type { ChiriWord } from "../read/consume/consumeWord";
export interface ChiriType<TYPE extends string = string> {
    type: "type";
    name: ChiriWord<TYPE>;
    generics: ChiriType[];
    isGeneric?: true;
}
export interface ChiriTypeGeneric extends ChiriType {
    isGeneric: true;
}
export declare namespace ChiriType {
    function of<TYPE extends string = string>(name: TYPE, ...generics: (string | ChiriType)[]): ChiriType<TYPE>;
    function stringify(type: ChiriType, stack?: boolean): string;
}
