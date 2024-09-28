import type ChiriReader from "../ChiriReader";
import type { ChiriPosition, ChiriStatement } from "../ChiriReader";
import { type ChiriWord } from "./consumeWord";
export interface ChiriMixin {
    type: "mixin";
    name: ChiriWord;
    content: ChiriStatement[];
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader) => Promise<ChiriMixin | undefined>;
export default _default;
