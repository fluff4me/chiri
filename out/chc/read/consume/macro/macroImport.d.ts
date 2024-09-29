import type { ChiriPosition } from "../../ChiriReader";
import type { ChiriPath } from "../consumePathOptional";
import type { ChiriValueText } from "../consumeValueText";
export interface ChiriImport {
    type: "import";
    paths: ChiriPath[];
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriImport>;
export default _default;
export interface ChiriCSSImport {
    type: "import-css";
    imports: ChiriValueText[];
    position: ChiriPosition;
}
export declare const macroImportCSS: import("./MacroConstruct").ChiriMacroInternal<ChiriCSSImport>;
