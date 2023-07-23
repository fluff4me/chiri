//@ts-check
const args = { "*": /** @type {string[]} */([]) };
for (let i = 2; i < process.argv.length; i++) {
	const arg = process.argv[i];
	if (arg[0] === "-" && (arg[2] || arg[1] !== "-")) {
		if (arg[1] === "-") {
			args[arg.slice(2)] = process.argv[++i];
			continue;
		}

		args[arg.slice(1)] = true;
		continue;
	}

	args["*"].push(arg);
}

const fsp = require("fs/promises");
const fs = require("fs");
const path = require("path");
const ansi = require("./ansi");
const thcPath = path.resolve("thc.js");

function relToCwd (file) {
	return path.relative(process.cwd(), file);
}

(async () => {
	const files = args["*"].map(file => path.resolve(file));
	compileAll(files, args.w);

	if (args.w) {
		let timeout;
		fs.watch(thcPath, { persistent: true }, () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => compileAll(files), 10);
		}).on("error", console.error);
	}
})();

async function compileAll (files, watch = false) {
	for (const file of files) {
		await compile(file);
		if (watch) {
			console.log(ansi.label + "watch", ansi.path + relToCwd(file), ansi.reset);
			let timeout;
			fs.watch(file, { persistent: true }, () => {
				clearTimeout(timeout);
				timeout = setTimeout(() => compile(file), 10);
			}).on("error", console.error);
		}
	}
}

async function compile (file) {
	const th = await fsp.readFile(file, "utf8")
		.catch(err => {
			console.error(ansi.err + "Failed to read input file", file, err, ansi.reset);
			return "";
		});

	delete require.cache[thcPath];
	/** @type {import("./thc")} */
	const thc = require(thcPath);
	const result = thc(th);
	const outFile = path.join(path.dirname(file), path.basename(file, path.extname(file)) + ".js");
	console.log(ansi.label + "thc", ansi.path + relToCwd(file), ansi.label + "=>", ansi.path + relToCwd(outFile), ansi.reset);
	return fsp.writeFile(outFile, result);
}
