import type { ChiriValueText } from "../read/consume/consumeValueText";
import type ChiriCompiler from "../write/ChiriCompiler";
declare const stringifyText: (compiler: ChiriCompiler, text: ChiriValueText) => string;
export default stringifyText;
