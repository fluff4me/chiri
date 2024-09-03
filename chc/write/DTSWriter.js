const Writer = require("./Writer");

module.exports = class DTSWriter extends Writer {

	/**
	 * @param {ChiriAST} ast
	 * @param {string} dest
	 * @param {ChiriWriteConfig=} config 
	 */
	constructor (ast, dest, config) {
		super(ast, dest, { extension: ".d.ts", ...config });
	}
}
