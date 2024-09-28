import type ChiriReader from "../ChiriReader";
import type { ChiriPosition, ChiriStatement } from "../ChiriReader";
import type { ChiriWordInterpolated } from "./consumeWordInterpolatedOptional";
export interface ChiriMixin {
    type: "mixin";
    name: ChiriWordInterpolated;
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader) => Promise<ChiriMixin | undefined>;
export default _default;
