import type ChiriReader from "../read/ChiriReader";
import type { Value } from "../util/resolveExpression";
import type { ChiriType } from "./ChiriType";
import type ChiriTypeManager from "./ChiriTypeManager";
interface TypeDefinition<TYPE extends string = string> {
    type: ChiriType<TYPE>;
    consumeOptionalConstructor?(reader: ChiriReader): object | undefined;
    consumeType?(reader: ChiriReader): string | undefined;
    coerce?(value: Value, error: () => any): Value;
    generics?: number | true | string[][];
    stringable?: true;
    is?(value: Value): boolean;
    isAssignable?(types: ChiriTypeManager, type: ChiriType, toType: ChiriType): boolean;
}
declare function TypeDefinition<TYPE extends string = string>(definition: TypeDefinition<TYPE>): TypeDefinition<TYPE>;
export default TypeDefinition;
