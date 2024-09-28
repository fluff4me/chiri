import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
export interface ChiriWord<WORD extends string = string> {
    type: "word";
    value: WORD;
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader, ...expectedWords: string[]) => ChiriWord;
export default _default;
