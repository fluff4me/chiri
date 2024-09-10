import type { ChiriPath } from "../../ChiriAST"
import type ChiriReader from "../ChiriReader"

const isValidPathCharacter = {
	...{}
	, win32: (c: number) => true // FAT32, NTFS
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
	, darwin: (c: number) => true // HFS, HFS+ 
		&& c !== 58 // :
		&& c !== 47 // /
		&& c !== 10 // \n
		&& c !== 13 // \r
	, linux: (c: number) => true // ext[2-4]
		&& c !== 0 // NUL
		&& c !== 47 // /
		&& c !== 10 // \n
		&& c !== 13 // \r
	, aix: undefined
	, android: undefined
	, cygwin: undefined
	, freebsd: undefined
	, haiku: undefined
	, netbsd: undefined
	, openbsd: undefined
	, sunos: undefined,
}[process.platform]

if (!isValidPathCharacter)
	throw new Error(`Unsupported platform '${process.platform}'`)

const consumePathSegment = (reader: ChiriReader): string => {
	let segment = ""
	while (isValidPathCharacter(reader.input.charCodeAt(reader.i))) {
		segment += reader.input[reader.i]
		reader.i++
	}
	return segment
}

const isValidNodeModuleCharacter = (c: number) => false
	|| (c >= 97 && c <= 122) // a-z
	|| (c >= 48 && c <= 57) // 0-9
	|| c === 45 // -
	|| c === 46 // .
	|| c === 95 // _

const consumeNodeModuleNameOptional = (reader: ChiriReader): string | undefined => {
	const s = reader.i
	switch (reader.input[reader.i]) {
		case "_": case ".": return undefined
	}

	let moduleName = ""
	while (isValidNodeModuleCharacter(reader.input.charCodeAt(reader.i))) {
		moduleName += reader.input[reader.i]
		reader.i++
	}

	if (moduleName.length && moduleName.length <= 214 && reader.input[reader.i++] === ":")
		return moduleName

	reader.i = s
	return undefined
}

export default (reader: ChiriReader): ChiriPath | undefined => {
	const s = reader.i
	let path: string | undefined = ""

	const moduleName = consumeNodeModuleNameOptional(reader)

	const absolute = !moduleName && reader.consumeOptional("/")
	if (absolute)
		path += "/"

	reader.i--
	do {
		reader.i++
		path += `/${consumePathSegment(reader)}`
	} while (reader.input[reader.i] === "/")
	path = (path || undefined)?.slice(1)

	if (!path) {
		reader.i = s
		return undefined
	}

	return {
		module: moduleName,
		path,
		i: s,
	}
}
