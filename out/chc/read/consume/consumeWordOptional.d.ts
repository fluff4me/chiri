import type ChiriReader from '../ChiriReader';
import type { ChiriWord } from './consumeWord';
export default function (reader: ChiriReader): ChiriWord<string> | undefined;
export default function <const WORDS extends string[]>(reader: ChiriReader, ...expectedWords: WORDS): ChiriWord<WORDS[number]> | undefined;
