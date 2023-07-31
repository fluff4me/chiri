// @ts-check
/** 
 * @param {import("../ThetaReader")} reader
 * @param {string=} expectedWord
 * @returns {ThetaWord}
 */
module.exports = (reader, expectedWord) => {
	const e = reader.i;
	if (expectedWord) {
		return {
			type: "word",
			value: reader.consume(expectedWord),
			position: reader.getPosition(e),
		};
	}

	if (!reader.isLetter())
		throw reader.error("Words must start with a letter");

	let word = reader.input[reader.i++];
	for (; reader.i < reader.input.length; reader.i++)
		if (reader.isWordChar())
			word += reader.input[reader.i];
		else
			break;

	return {
		type: "word",
		value: word,
		position: reader.getPosition(e),
	};
};
