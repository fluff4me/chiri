import type { ChiriBaseText } from "../read/consume/consumeValueText";
import type { ChiriWord } from "../read/consume/consumeWord";
import type ChiriCompiler from "../write/ChiriCompiler";
declare const stringifyText: (compiler: ChiriCompiler, text: ChiriBaseText | ChiriWord) => string;
export default stringifyText;
