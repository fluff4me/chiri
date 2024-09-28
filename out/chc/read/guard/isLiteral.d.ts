import type { ChiriLiteralList } from "../../type/typeList";
import type { ChiriLiteralString } from "../consume/consumeStringOptional";
import type { ChiriLiteralBool, ChiriLiteralUndefined } from "../consume/consumeTypeConstructorOptional";
import type { ChiriLiteralNumeric } from "../consume/numeric/Numeric";
export default function (value: unknown, subType?: "string"): value is ChiriLiteralString;
export default function (value: unknown, subType?: "uint" | "int" | "dec"): value is ChiriLiteralNumeric;
export default function (value: unknown, subType?: "bool"): value is ChiriLiteralBool;
export default function (value: unknown, subType?: "undefined"): value is ChiriLiteralUndefined;
export default function (value: unknown, subType?: "list"): value is ChiriLiteralList;
