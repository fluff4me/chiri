import type ChiriReader from "../ChiriReader";
/**
 * Loop:
 * - Consumes newline. If not encountering a newline, return number of consumed newlines
 * - Consumes indentation to expected #
 * 	- If encountering more, throw
 * 	- If encountering less, return number of consumed newlines and return to before consuming most recent newline
 * 	- If encountering right amount
 * 		- If the rest of the line is blank, throw
 * 		- Else continue
 * @param ignoreExtraIndentation `true` to disable throwing on extra indentation
 * @returns Lines consumed
 */
declare const _default: (reader: ChiriReader, ignoreExtraIndentation?: boolean) => number;
export default _default;
