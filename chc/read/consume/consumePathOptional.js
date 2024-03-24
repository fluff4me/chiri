const ChiriReader = require("../ChiriReader");

const isValidPathCharacter = {
	win32: c => true // FAT32, NTFS
		&& c !== 0 // NUL
		&& c !== 92 // \
		&& c !== 47 // /
		&& c !== 58 // :
		&& c !== 42 // *
		&& c !== 63 // ?
		&& c !== 34 // "
		&& c !== 60 // <
		&& c !== 62 // >
		&& c !== 124 // |
		&& c !== 10 // \n
		&& c !== 13 // \r
	, darwin: c => true // HFS, HFS+ 
		&& c !== 58 // :
		&& c !== 47 // /
		&& c !== 10 // \n
		&& c !== 13 // \r
	, linux: c => true // ext[2-4]
		&& c !== 0 // NUL
		&& c !== 47 // /
		&& c !== 10 // \n
		&& c !== 13 // \r
}[process.platform];

/**
 * @param {ChiriReader} reader
 * @returns {string}
 */
const consumePathSegment = reader => {
	let segment = "";
	while (isValidPathCharacter(reader.input.charCodeAt(reader.i))) {
		segment += reader.input[reader.i];
		reader.i++;
	}
	return segment;
};

/**
 * @param {number} c 
 */
const isValidNodeModuleCharacter = c => false
	|| (c >= 97 && c <= 122) // a-z
	|| (c >= 48 && c <= 57) // 0-9
	|| c === 45 // -
	|| c === 46 // .
	|| c === 95 // _

/**
 * @param {ChiriReader} reader 
 * @returns {string=}
 */
const consumeNodeModuleNameOptional = reader => {
	const s = reader.i;
	switch (reader.input[reader.i]) {
		case "_": case ".": return undefined;
	}

	let moduleName = "";
	while (isValidNodeModuleCharacter(reader.input.charCodeAt(reader.i))) {
		moduleName += reader.input[reader.i];
		reader.i++;
	}

	if (moduleName.length && moduleName.length <= 214 && reader.input[reader.i++] === ":")
		return moduleName;

	reader.i = s;
	return undefined;
};

/**
 * @typedef ChiriPath
 * @property {string=} module
 * @property {string} path
 */

/**
 * @param {ChiriReader} reader 
 * @returns {ChiriPath=}
 */
module.exports = reader => {
	const s = reader.i;
	/** @type {string=} */
	let path = "";

	const moduleName = consumeNodeModuleNameOptional(reader);

	const absolute = !moduleName && reader.consumeOptional("/");
	if (absolute)
		path += "/";

	reader.i--;
	do {
		reader.i++;
		path += `/${consumePathSegment(reader)}`;
	} while (reader.input[reader.i] === "/");
	path = (path || undefined)?.slice(1);

	if (!path) {
		reader.i = s;
		return undefined;
	}

	return {
		module: moduleName,
		path,
	};
};
