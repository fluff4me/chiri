const Writer = require("./Writer");

module.exports = class CSSWriter extends Writer {

	/**
	 * @param {ChiriAST} ast
	 * @param {string} dest
	 * @param {ChiriWriteConfig=} config 
	 */
	constructor (ast, dest, config) {
		super(ast, dest, { extension: ".css", ...config });
	}
}
