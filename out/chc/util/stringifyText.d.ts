import type { ChiriValueText } from "../read/consume/consumeValueText";
import type { ChiriWord } from "../read/consume/consumeWord";
import type ChiriCompiler from "../write/ChiriCompiler";
declare const stringifyText: (compiler: ChiriCompiler, text: ChiriValueText | ChiriWord) => string;
export default stringifyText;
