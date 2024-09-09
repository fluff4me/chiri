/**
 * @param {ChiriFunctionBase} fn
 * @returns {ChiriCompilerVariable[]}
 */
module.exports = fn => {
	return fn.content.filter(/** @type {(statement: ChiriStatement) => statement is ChiriCompilerVariable} */ statement =>
		statement.type === "variable" && statement.assignment !== "=");
};
