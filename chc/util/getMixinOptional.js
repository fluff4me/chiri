/**
 * @param {string} name
 * @param {...ChiriStatement[]} blocks
 * @returns {ChiriMixin=}
 */
module.exports = (name, ...blocks) => {
	for (let i = blocks.length - 1; i--; i >= 0) {
		const statements = blocks[i];
		for (let j = statements.length; j--; j >= 0) {
			const statement = statements[j];
			if (statement.type === "mixin" && statement.name.value === name) {
				return statement;
			}
		}
	}
};
