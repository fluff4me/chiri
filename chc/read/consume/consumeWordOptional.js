// @ts-check

const consumeWord = require("./consumeWord");

/** 
 * @param {import("../ChiriReader")} reader
 * @param {string=} expectedWord
 * @returns {ChiriWord=}
 */
module.exports = (reader, expectedWord) => {
	if (expectedWord) {
		const e = reader.i;
		const word = reader.consumeOptional(expectedWord);
		return !word ? undefined : {
			type: "word",
			value: word,
			position: reader.getPosition(e),
		};
	}

	return !expectedWord && !reader.isLetter() ? undefined : consumeWord(reader, expectedWord);
};
