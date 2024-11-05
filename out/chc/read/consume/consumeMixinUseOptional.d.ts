import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional";
export interface ChiriMixinUse {
    type: "mixin-use";
    name: ChiriWordInterpolated;
    spread?: true;
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader) => ChiriMixinUse | undefined;
export default _default;
