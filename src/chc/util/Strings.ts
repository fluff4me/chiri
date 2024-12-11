import { inspect } from "util"
import ansi from "../../ansi"

namespace Strings {
	export function symbolise (text: string) {
		return text
			.replace(/\r/g, ansi.whitespace + "\u240D" + ansi.reset)
			.replace(/\n/g, ansi.whitespace + "\u240A" + ansi.reset)
			.replace(/ /g, ansi.whitespace + "\u00B7" + ansi.reset)
			.replace(/\t/g, ansi.whitespace + "\u2192" + ansi.reset)
	}

	export function debug (value: unknown) {
		return inspect(value, undefined, Infinity, true)
	}
}

export default Strings
