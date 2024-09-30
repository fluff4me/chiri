import type ChiriReader from "../read/ChiriReader";
import type { Value } from "../util/resolveExpression";
import type ChiriCompiler from "../write/ChiriCompiler";
import type { ChiriTypeGeneric } from "./ChiriType";
import { ChiriType } from "./ChiriType";
import type TypeDefinition from "./TypeDefinition";
declare const binaryNumericOperators: readonly ["**", "+", "-", "*", "/", "%", "==", "!=", "<=", ">=", "<", ">"];
declare const unaryNumericOperators: readonly ["+", "-"];
declare const binaryBitwiseOperators: readonly ["&", "|", "^"];
declare const unaryBitwiseOperators: readonly ["~"];
declare const binaryBooleanOperators: readonly ["||", "&&", "==", "!="];
declare const unaryBooleanOperators: readonly ["!"];
declare const binaryStringOperators: readonly [".", "x", "==", "!="];
export type Operator = (typeof binaryNumericOperators)[number] | (typeof unaryNumericOperators)[number] | (typeof binaryBitwiseOperators)[number] | (typeof unaryBitwiseOperators)[number] | (typeof binaryBooleanOperators)[number] | (typeof unaryBooleanOperators)[number] | (typeof binaryStringOperators)[number];
type BinaryCoercion = readonly [string, undefined] | readonly [undefined, string];
export default class ChiriTypeManager {
    private readonly host;
    types: Record<string, TypeDefinition>;
    binaryOperators: Record<string, Partial<Record<Operator, Record<string, string>>>>;
    unaryOperators: Partial<Record<Operator, Record<string, string>>>;
    binaryOperatorCoercion: Partial<Record<Operator, string | BinaryCoercion>>;
    unaryOperatorCoercion: Partial<Record<Operator, true>>;
    registerBinaryOperator(typeA: string, operator: Operator, typeB?: string, output?: string, reversible?: boolean, coercion?: string | BinaryCoercion): void;
    registerUnaryOperator(operator: Operator, type: string, output?: string, coercion?: true): void;
    constructor(host: ChiriReader | ChiriCompiler);
    registerGenerics(...generics: ChiriTypeGeneric[]): void;
    deregisterGenerics(...generics: ChiriTypeGeneric[]): void;
    coerce(value: Value, type: ChiriType, fromType?: ChiriType): Value;
    canCoerceOperandB(operator?: string): boolean;
    isAssignable(type: ChiriType, ...toTypes: ChiriType[]): boolean;
    dedupe(...types: ChiriType[]): ChiriType<string>[];
    intersection(...types: ChiriType[]): ChiriType<string>;
    with(...generics: ChiriTypeGeneric[]): {
        do: <T>(handler: () => T) => T;
    };
    clone(reader: ChiriReader): ChiriTypeManager;
}
export {};
