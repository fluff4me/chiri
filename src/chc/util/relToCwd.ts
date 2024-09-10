import path from "path";

export default (file: string, cwd = process.cwd()) =>
	(file.startsWith(cwd) ? path.relative(cwd, file) : file)
		.replaceAll("\\", "/");
