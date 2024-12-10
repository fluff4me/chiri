import type { ChiriTypeGeneric } from "../../type/ChiriType";
import { ChiriType } from "../../type/ChiriType";
import type ChiriReader from "../ChiriReader";
export declare function consumeType(reader: ChiriReader): ChiriType;
export declare function consumeType(reader: ChiriReader, genericDeclaration: true): ChiriTypeGeneric;
export declare function consumeTypeOptional(reader: ChiriReader, genericDeclaration?: false, throwOnInvalidName?: true): ChiriType | undefined;
export declare function consumeTypeOptional(reader: ChiriReader, genericDeclaration: true, throwOnInvalidName?: true): ChiriTypeGeneric | undefined;
