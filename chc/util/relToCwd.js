const path = require("path");

/**
 * @param {string} file
 * @param {string=} cwd
 */
module.exports = function relToCwd (file, cwd = process.cwd()) {
	return path.relative(process.cwd(), file)
		.replaceAll("\\", "/");
}
