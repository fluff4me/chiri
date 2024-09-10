import ChiriReader from "../ChiriReader";

/**
 * Consume indent up to expected #
 * @returns Undefined if not enough indentation found, otherwise indentations consumed
 */
export default (reader: ChiriReader, expected?: number) => {
	let indent = 0;
	for (; reader.i < reader.input.length; reader.i++) {
		if (indent === expected)
			break;

		if (reader.input[reader.i] !== "\t")
			break;

		indent++;
	}

	if (expected !== undefined && indent !== expected)
		return undefined;

	return indent;
};
