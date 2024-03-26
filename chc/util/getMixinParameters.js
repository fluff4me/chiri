/**
 * @param {ChiriMixin} mixin
 * @returns {ChiriCompilerVariable[]}
 */
module.exports = mixin => {
	return mixin.content.filter(/** @type {(statement: ChiriStatement) => statement is ChiriCompilerVariable} */ statement =>
		statement.type === "variable");
};
