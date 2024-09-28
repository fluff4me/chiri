import type { ArrayOr } from "./Type";
declare namespace Arrays {
    function resolve<T>(arrayOr: ArrayOr<T>): T[];
    function filterNullish<T>(value: T, index: number, array: T[]): value is Exclude<T, undefined | null>;
    function insertBefore<T>(array: T[], value: T, referenceValue: T): T[];
}
export default Arrays;
