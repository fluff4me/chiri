import type ChiriReader from "../ChiriReader";
import type { ChiriPosition } from "../ChiriReader";
export interface ChiriDocumentation {
    type: "documentation";
    content: string;
    position: ChiriPosition;
}
declare const _default: (reader: ChiriReader) => ChiriDocumentation | undefined;
export default _default;
