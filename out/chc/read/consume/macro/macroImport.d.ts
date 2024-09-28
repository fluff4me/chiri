import type { ChiriPath } from "../consumePathOptional";
export interface ChiriImport {
    type: "import";
    paths: ChiriPath[];
}
declare const _default: import("./MacroConstruct").ChiriMacroInternal<ChiriImport>;
export default _default;
