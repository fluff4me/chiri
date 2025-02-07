import type ChiriReader from "../ChiriReader";
import type { ChiriWord } from "./consumeWord";
declare const _default: <const WORDS extends string[]>(reader: ChiriReader, ...expectedWords: WORDS) => ChiriWord<WORDS[number]> | undefined;
export default _default;
