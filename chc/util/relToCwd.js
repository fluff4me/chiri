const path = require("path");

/**
 * @param {string} file
 * @param {string=} cwd
 */
module.exports = function relToCwd (file, cwd = process.cwd()) {
	return (file.startsWith(cwd) ? path.relative(cwd, file) : file)
		.replaceAll("\\", "/");
}
