import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
import type { ChiriValueText, default as consumeValueTextType } from "./consumeValueText";
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional";
export interface ChiriInterpolationProperty {
    type: "interpolation-property";
    name: ChiriWordInterpolated;
    defaultValue?: ChiriValueText;
    position: ChiriPosition;
}
export interface ChiriInterpolationPropertyName {
    type: "interpolation-property-name";
    name: ChiriWordInterpolated;
    position: ChiriPosition;
}
declare function consumeCustomPropertyInterpolation(reader: ChiriReader, varType: "$" | "$$"): ChiriInterpolationProperty | ChiriInterpolationPropertyName;
declare namespace consumeCustomPropertyInterpolation {
    let consumeValueText: typeof consumeValueTextType;
}
export default consumeCustomPropertyInterpolation;
