import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
export interface ChiriWord<WORD extends string = string> {
    type: "word";
    value: WORD;
    position: ChiriPosition;
}
export default function consumeWord(reader: ChiriReader): ChiriWord;
export default function consumeWord<WORD extends string>(reader: ChiriReader, ...expectedWords: WORD[]): ChiriWord<WORD>;
