import type ChiriReader from "../ChiriReader";
export interface ChiriPath {
    type: "path";
    module?: string;
    path: string;
    i: number;
}
declare const _default: (reader: ChiriReader) => ChiriPath | undefined;
export default _default;
