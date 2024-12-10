import type ChiriReader from "../read/ChiriReader";
import type { Value } from "../util/resolveExpression";
import type ChiriCompiler from "../write/ChiriCompiler";
import type { ChiriTypeGeneric } from "./ChiriType";
import { ChiriType } from "./ChiriType";
import type TypeDefinition from "./TypeDefinition";
declare const binaryNumericOperators: readonly ["**", "+", "-", "*", "/", "%", "==", "!=", "<=", ">=", "<", ">"];
declare const unaryNumericOperators: readonly ["+", "-"];
declare const binaryBitwiseOperators: readonly ["&", "|", "^", "<<", ">>", ">>>"];
declare const unaryBitwiseOperators: readonly ["~"];
declare const binaryBooleanOperators: readonly ["||", "&&", "==", "!="];
declare const unaryBooleanOperators: readonly ["!"];
declare const binaryStringOperators: readonly [".", "x", "==", "!="];
declare const binaryOtherOperators: readonly ["is"];
declare const unaryOtherOperators: readonly ["exists"];
export type Operator = (typeof binaryNumericOperators)[number] | (typeof unaryNumericOperators)[number] | (typeof binaryBitwiseOperators)[number] | (typeof unaryBitwiseOperators)[number] | (typeof binaryBooleanOperators)[number] | (typeof unaryBooleanOperators)[number] | (typeof binaryStringOperators)[number] | (typeof unaryOtherOperators)[number] | (typeof binaryOtherOperators)[number];
type BinaryCoercion = readonly [string, undefined] | readonly [undefined, string];
type BinaryOperationData<DATA> = Record<string, Partial<Record<Operator, Record<string, DATA | undefined>>> | undefined>;
type UnaryOperationData<DATA> = Partial<Record<Operator, Record<string, DATA | undefined>>>;
export default class ChiriTypeManager {
    private readonly host;
    precedence: Operator[][];
    types: Record<string, TypeDefinition>;
    binaryOperators: BinaryOperationData<string>;
    unaryOperators: UnaryOperationData<string>;
    binaryOperatorCoercion: BinaryOperationData<string | BinaryCoercion>;
    unaryOperatorCoercion: UnaryOperationData<string>;
    registerBinaryOperator(typeA: string, operator: Operator, typeB?: string, output?: string, reversible?: boolean): void;
    registerUnaryOperator(operator: Operator, type: string, output?: string): void;
    registerBinaryCoercion(operator: Operator, coercion: string | BinaryCoercion): void;
    registerUnaryCoercion(operator: Operator, coercion: string): void;
    constructor(host: ChiriReader | ChiriCompiler);
    registerGenerics(...generics: ChiriTypeGeneric[]): void;
    deregisterGenerics(...generics: ChiriTypeGeneric[]): void;
    coerce(value: Value, type: ChiriType, fromType?: ChiriType): Value;
    canCoerceOperandB(operandAType: string, operator: string, operandBType: string): boolean;
    isAssignable(type: ChiriType, ...toTypes: ChiriType[]): boolean;
    isEveryType(types: ChiriType[]): boolean;
    dedupe(...types: ChiriType[]): ChiriType<string>[];
    intersection(...types: ChiriType[]): ChiriType<string>;
    with(...generics: ChiriTypeGeneric[]): {
        do: <T>(handler: () => T) => T;
    };
    clone(reader: ChiriReader): ChiriTypeManager;
}
export {};
