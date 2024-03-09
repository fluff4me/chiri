// @ts-check

/**
 * Consume indent up to expected #
 * @param {import("../ChiriReader")} reader
 * @param {number=} expected 
 * @returns Undefined if not enough indentation found, otherwise indentations consumed
 */
module.exports = (reader, expected) => {
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
