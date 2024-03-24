/**
 * @param {string} name
 * @param {...ChiriStatement[]} blocks
 * @returns {ChiriCompilerVariable=}
 */
module.exports = (name, ...blocks) => {
	let valuelessMatch;
	for (let i = blocks.length - 1; i--; i >= 0) {
		const statements = blocks[i];
		for (let j = statements.length; j--; j >= 0) {
			const statement = statements[j];
			if (statement.type === "variable" && statement.name.value === name) {
				if (statement.expression)
					return statement;

				valuelessMatch = statement;
			}
		}
	}

	return valuelessMatch;
};
