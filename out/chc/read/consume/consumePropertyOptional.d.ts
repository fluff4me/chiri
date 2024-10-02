import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
import type { ChiriValueText } from "./consumeValueText";
import type { ChiriWord } from "./consumeWord";
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional";
export interface ChiriProperty {
    type: "property";
    isCustomProperty?: true;
    property: ChiriWordInterpolated;
    value: ChiriValueText;
    position: ChiriPosition;
}
export interface ChiriPropertyDefinition {
    type: "property-definition";
    syntax: ChiriWord;
    property: ChiriWordInterpolated;
    value: ChiriValueText;
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader) => ChiriProperty | ChiriPropertyDefinition | undefined;
export default _default;
