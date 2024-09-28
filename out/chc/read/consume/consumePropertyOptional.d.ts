import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
import type { ChiriValueText } from "./consumeValueText";
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional";
export interface ChiriProperty {
    type: "property";
    isCustomProperty?: true;
    property: ChiriWordInterpolated;
    value: ChiriValueText;
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader) => ChiriProperty | undefined;
export default _default;
