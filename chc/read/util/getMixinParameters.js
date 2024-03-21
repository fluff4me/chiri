/**
 * @param {ChiriMixin} mixin
 * @returns {ChiriCompilerVariable[]}
 */
module.exports = mixin => {
	return mixin.content.filter(statement => statement.type === "variable");
};
