import path from "path"
import { LIB_ROOT } from "../../constants"

export default (file: string, cwd = process.cwd()) => {
	file = file.startsWith(cwd) ? path.relative(cwd, file) : file
	file = file.startsWith(LIB_ROOT) ? `lib:${path.relative(LIB_ROOT, file)}` : file
	return file.replaceAll("\\", "/")
}
